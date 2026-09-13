#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <shellapi.h>
#include <shlwapi.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define WM_TRAYICON (WM_USER + 1)
#define ID_TRAY_EXIT 1001
#define ID_TRAY_OPEN 1002
#define ID_TRAY_WORD 1003
#define ID_TRAY_ABOUT 1004
#define ID_TRAY_KEYHELPER 1005

NOTIFYICONDATAA nid;
HWND g_hWnd = NULL;
HINSTANCE g_hInstance = NULL;
char g_AppPath[MAX_PATH];
char g_WebRootDir[MAX_PATH];
int g_ServerPort = 0;
SOCKET g_ListenSocket = INVALID_SOCKET;
volatile BOOL g_Running = TRUE;

void GetApplicationPaths() {
    GetModuleFileNameA(NULL, g_AppPath, MAX_PATH);
    PathRemoveFileSpecA(g_AppPath);
    
    // Check if app/index.html exists first (standard bundle structure)
    char testPath[MAX_PATH];
    snprintf(testPath, sizeof(testPath), "%s\\app\\index.html", g_AppPath);
    if (GetFileAttributesA(testPath) != INVALID_FILE_ATTRIBUTES) {
        snprintf(g_WebRootDir, sizeof(g_WebRootDir), "%s\\app", g_AppPath);
    } else {
        snprintf(g_WebRootDir, sizeof(g_WebRootDir), "%s", g_AppPath);
    }
}

const char *GetMimeType(const char *path) {
    const char *ext = PathFindExtensionA(path);
    if (!ext) return "application/octet-stream";
    if (_stricmp(ext, ".html") == 0 || _stricmp(ext, ".htm") == 0) return "text/html; charset=utf-8";
    if (_stricmp(ext, ".js") == 0 || _stricmp(ext, ".mjs") == 0) return "application/javascript; charset=utf-8";
    if (_stricmp(ext, ".css") == 0) return "text/css; charset=utf-8";
    if (_stricmp(ext, ".json") == 0) return "application/json; charset=utf-8";
    if (_stricmp(ext, ".png") == 0) return "image/png";
    if (_stricmp(ext, ".jpg") == 0 || _stricmp(ext, ".jpeg") == 0) return "image/jpeg";
    if (_stricmp(ext, ".gif") == 0) return "image/gif";
    if (_stricmp(ext, ".svg") == 0) return "image/svg+xml";
    if (_stricmp(ext, ".ico") == 0) return "image/x-icon";
    if (_stricmp(ext, ".woff2") == 0) return "font/woff2";
    if (_stricmp(ext, ".woff") == 0) return "font/woff";
    if (_stricmp(ext, ".ttf") == 0) return "font/ttf";
    if (_stricmp(ext, ".otf") == 0) return "font/otf";
    if (_stricmp(ext, ".bas") == 0) return "text/plain; charset=utf-8";
    if (_stricmp(ext, ".txt") == 0) return "text/plain; charset=utf-8";
    return "application/octet-stream";
}

void HandleClient(SOCKET client) {
    char reqBuffer[4096];
    int bytes = recv(client, reqBuffer, sizeof(reqBuffer) - 1, 0);
    if (bytes <= 0) {
        closesocket(client);
        return;
    }
    reqBuffer[bytes] = '\0';

    char method[16] = {0};
    char rawUrl[1024] = {0};
    if (sscanf(reqBuffer, "%15s %1023s", method, rawUrl) < 2) {
        closesocket(client);
        return;
    }

    // CORS preflight OPTIONS response
    if (_stricmp(method, "OPTIONS") == 0) {
        const char *corsResp = 
            "HTTP/1.1 204 No Content\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            "Access-Control-Allow-Methods: GET, HEAD, OPTIONS\r\n"
            "Access-Control-Allow-Headers: *\r\n"
            "Content-Length: 0\r\n"
            "Connection: close\r\n\r\n";
        send(client, corsResp, (int)strlen(corsResp), 0);
        closesocket(client);
        return;
    }

    // Strip query string (?v=...)
    char *q = strchr(rawUrl, '?');
    if (q) *q = '\0';

    // Prevent path traversal
    if (strstr(rawUrl, "..") != NULL) {
        const char *forbidden = "HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\nConnection: close\r\n\r\n";
        send(client, forbidden, (int)strlen(forbidden), 0);
        closesocket(client);
        return;
    }

    // Convert URL path to relative file path with backslashes
    char relPath[MAX_PATH];
    if (strcmp(rawUrl, "/") == 0 || strlen(rawUrl) == 0) {
        strncpy(relPath, "\\index.html", sizeof(relPath) - 1);
        relPath[sizeof(relPath) - 1] = '\0';
    } else {
        size_t i;
        for (i = 0; i < sizeof(relPath) - 1 && rawUrl[i] != '\0'; i++) {
            relPath[i] = (rawUrl[i] == '/') ? '\\' : rawUrl[i];
        }
        relPath[i] = '\0';
    }

    char fullPath[MAX_PATH];
    snprintf(fullPath, sizeof(fullPath), "%s%s", g_WebRootDir, relPath);

    // If file doesn't exist, check for index.html (SPA client-side routing)
    if (GetFileAttributesA(fullPath) == INVALID_FILE_ATTRIBUTES) {
        snprintf(fullPath, sizeof(fullPath), "%s\\index.html", g_WebRootDir);
    }

    FILE *f = fopen(fullPath, "rb");
    if (!f) {
        const char *notFound = "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n";
        send(client, notFound, (int)strlen(notFound), 0);
        closesocket(client);
        return;
    }

    fseek(f, 0, SEEK_END);
    long fileSize = ftell(f);
    fseek(f, 0, SEEK_SET);

    const char *mime = GetMimeType(fullPath);

    char headers[1024];
    int hlen = snprintf(headers, sizeof(headers),
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: %s\r\n"
        "Content-Length: %ld\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Access-Control-Allow-Methods: GET, HEAD, OPTIONS\r\n"
        "Access-Control-Allow-Headers: *\r\n"
        "Cache-Control: no-cache\r\n"
        "Connection: close\r\n\r\n",
        mime, fileSize);

    send(client, headers, hlen, 0);

    char sendBuf[16384];
    size_t nRead;
    while ((nRead = fread(sendBuf, 1, sizeof(sendBuf), f)) > 0) {
        int sent = send(client, sendBuf, (int)nRead, 0);
        if (sent <= 0) break;
    }

    fclose(f);
    closesocket(client);
}

DWORD WINAPI HttpServerThread(LPVOID lpParam) {
    (void)lpParam;
    while (g_Running && g_ListenSocket != INVALID_SOCKET) {
        SOCKET client = accept(g_ListenSocket, NULL, NULL);
        if (client == INVALID_SOCKET) {
            if (!g_Running) break;
            Sleep(10);
            continue;
        }
        HandleClient(client);
    }
    return 0;
}

BOOL StartHttpServer() {
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) {
        return FALSE;
    }

    g_ListenSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (g_ListenSocket == INVALID_SOCKET) {
        WSACleanup();
        return FALSE;
    }

    int opt = 1;
    setsockopt(g_ListenSocket, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));

    struct sockaddr_in saddr;
    memset(&saddr, 0, sizeof(saddr));
    saddr.sin_family = AF_INET;
    saddr.sin_addr.s_addr = inet_addr("127.0.0.1");
    saddr.sin_port = htons(0); // System automatically assigns an available port

    if (bind(g_ListenSocket, (struct sockaddr*)&saddr, sizeof(saddr)) == SOCKET_ERROR) {
        closesocket(g_ListenSocket);
        WSACleanup();
        return FALSE;
    }

    if (listen(g_ListenSocket, SOMAXCONN) == SOCKET_ERROR) {
        closesocket(g_ListenSocket);
        WSACleanup();
        return FALSE;
    }

    struct sockaddr_in assigned;
    int len = sizeof(assigned);
    if (getsockname(g_ListenSocket, (struct sockaddr*)&assigned, &len) == 0) {
        g_ServerPort = ntohs(assigned.sin_port);
    } else {
        closesocket(g_ListenSocket);
        WSACleanup();
        return FALSE;
    }

    CreateThread(NULL, 0, HttpServerThread, NULL, 0, NULL);
    return TRUE;
}

void LaunchApp() {
    if (g_ServerPort <= 0) {
        MessageBoxA(NULL, 
            "SanTyper local offline server failed to start.\nPlease verify your Windows firewall or network settings.", 
            "SanTyper - Error", 
            MB_ICONERROR | MB_OK);
        return;
    }

    char targetUrl[256];
    snprintf(targetUrl, sizeof(targetUrl), "http://127.0.0.1:%d/", g_ServerPort);

    char params[512];
    snprintf(params, sizeof(params), "--app=\"%s\"", targetUrl);

    // 1. Try Microsoft Edge in standalone app window mode
    HINSTANCE hInst = ShellExecuteA(NULL, "open", "msedge.exe", params, NULL, SW_SHOWNORMAL);
    if ((INT_PTR)hInst <= 32) {
        // 2. Fallback to Google Chrome in standalone app window mode
        hInst = ShellExecuteA(NULL, "open", "chrome.exe", params, NULL, SW_SHOWNORMAL);
    }
    if ((INT_PTR)hInst <= 32) {
        // 3. Fallback to default registered system browser
        ShellExecuteA(NULL, "open", targetUrl, NULL, NULL, SW_SHOWNORMAL);
    }
}

void LaunchKeyHelper() {
    if (g_ServerPort <= 0) {
        MessageBoxA(NULL, 
            "SanTyper local offline server failed to start.\nPlease verify your Windows firewall or network settings.", 
            "SanTyper - Error", 
            MB_ICONERROR | MB_OK);
        return;
    }

    char targetUrl[256];
    snprintf(targetUrl, sizeof(targetUrl), "http://127.0.0.1:%d/?keyhelper=true#keyrep-master-navigation-bar", g_ServerPort);

    char params[512];
    snprintf(params, sizeof(params), "--app=\"%s\"", targetUrl);

    // 1. Try Microsoft Edge in standalone app window mode
    HINSTANCE hInst = ShellExecuteA(NULL, "open", "msedge.exe", params, NULL, SW_SHOWNORMAL);
    if ((INT_PTR)hInst <= 32) {
        // 2. Fallback to Google Chrome in standalone app window mode
        hInst = ShellExecuteA(NULL, "open", "chrome.exe", params, NULL, SW_SHOWNORMAL);
    }
    if ((INT_PTR)hInst <= 32) {
        // 3. Fallback to default registered system browser
        ShellExecuteA(NULL, "open", targetUrl, NULL, NULL, SW_SHOWNORMAL);
    }
}

void ShowAbout() {
    MessageBoxA(NULL, 
        "SanTyper Pro Suite - Sinhala Font Converter & KeyHelper\n"
        "Version: 1.0.0 (Offline Windows Desktop Edition)\n\n"
        "Lead Architect, Software Engineer & Owner:\n"
        "Sanchitha Charunya\n\n"
        "Copyright (C) 2026 Sanchitha Charunya.\n"
        "All Rights Reserved.\n\n"
        "Features:\n"
        "- 100% Offline Sinhala Unicode & Legacy Conversion\n"
        "- Embedded Fast Local HTTP Engine (Zero CORS Issues)\n"
        "- SanTyper Floating KeyHelper & Real-Time Typing Bar\n"
        "- Microsoft Word Pro Integration (Alt + S / U / L)\n"
        "- 100% Legal, Safe & Verified Algorithmic Engine",
        "About SanTyper - Sanchitha Charunya",
        MB_ICONINFORMATION | MB_OK);
}

void ShowWordGuide() {
    MessageBoxA(NULL, 
        "Microsoft Word Pro Shortcuts:\n\n"
        " - Alt + S : Smart Auto-Detect & Convert\n"
        " - Alt + U : Force Convert to Sinhala Unicode\n"
        " - Alt + L : Force Convert to Legacy (DL-Manel / FM-Abhaya)\n\n"
        "To enable in Word, run the SinhalaWordConverter.bas module included in the installation folder.",
        "Word Pro Integration - SanTyper",
        MB_ICONINFORMATION | MB_OK);
}

LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam) {
    switch (message) {
        case WM_CREATE:
            RegisterHotKey(hWnd, 1, MOD_CONTROL | MOD_ALT, 'S'); // Ctrl+Alt+S
            break;

        case WM_HOTKEY:
            if (wParam == 1) {
                LaunchApp();
            }
            break;

        case WM_TRAYICON:
            if (lParam == WM_RBUTTONUP || lParam == WM_LBUTTONUP) {
                POINT pt;
                GetCursorPos(&pt);
                HMENU hMenu = CreatePopupMenu();
                AppendMenuA(hMenu, MF_STRING, ID_TRAY_OPEN, "Open SanTyper Converter");
                AppendMenuA(hMenu, MF_STRING, ID_TRAY_KEYHELPER, "Open SanTyper KeyHelper (Floating Bar)");
                AppendMenuA(hMenu, MF_SEPARATOR, 0, NULL);
                AppendMenuA(hMenu, MF_STRING, ID_TRAY_WORD, "Word Integration Shortcuts");
                AppendMenuA(hMenu, MF_STRING, ID_TRAY_ABOUT, "About Sanchitha Charunya");
                AppendMenuA(hMenu, MF_SEPARATOR, 0, NULL);
                AppendMenuA(hMenu, MF_STRING, ID_TRAY_EXIT, "Exit SanTyper");

                SetForegroundWindow(hWnd);
                TrackPopupMenu(hMenu, TPM_RIGHTBUTTON, pt.x, pt.y, 0, hWnd, NULL);
                DestroyMenu(hMenu);
            }
            break;

        case WM_COMMAND:
            switch (LOWORD(wParam)) {
                case ID_TRAY_OPEN:
                    LaunchApp();
                    break;
                case ID_TRAY_KEYHELPER:
                    LaunchKeyHelper();
                    break;
                case ID_TRAY_WORD:
                    ShowWordGuide();
                    break;
                case ID_TRAY_ABOUT:
                    ShowAbout();
                    break;
                case ID_TRAY_EXIT:
                    g_Running = FALSE;
                    if (g_ListenSocket != INVALID_SOCKET) {
                        closesocket(g_ListenSocket);
                        g_ListenSocket = INVALID_SOCKET;
                    }
                    Shell_NotifyIconA(NIM_DELETE, &nid);
                    UnregisterHotKey(hWnd, 1);
                    WSACleanup();
                    PostQuitMessage(0);
                    break;
            }
            break;

        case WM_DESTROY:
            g_Running = FALSE;
            if (g_ListenSocket != INVALID_SOCKET) {
                closesocket(g_ListenSocket);
                g_ListenSocket = INVALID_SOCKET;
            }
            Shell_NotifyIconA(NIM_DELETE, &nid);
            UnregisterHotKey(hWnd, 1);
            WSACleanup();
            PostQuitMessage(0);
            break;

        default:
            return DefWindowProcA(hWnd, message, wParam, lParam);
    }
    return 0;
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    (void)hPrevInstance;
    (void)nCmdShow;
    g_hInstance = hInstance;

    // 1. Resolve application root directory
    GetApplicationPaths();

    // 2. Start embedded micro HTTP server on 127.0.0.1
    if (!StartHttpServer()) {
        MessageBoxA(NULL, 
            "Could not initialize SanTyper internal network service.\nPlease verify socket permissions.", 
            "SanTyper Startup Error", 
            MB_ICONERROR | MB_OK);
        return 1;
    }

    HICON hAppIcon = LoadIconA(hInstance, "IDI_APP_ICON");
    if (!hAppIcon) hAppIcon = LoadIconA(NULL, IDI_APPLICATION);

    // 3. Register background message window
    WNDCLASSEXA wcex = {0};
    wcex.cbSize = sizeof(WNDCLASSEXA);
    wcex.lpfnWndProc = WndProc;
    wcex.hInstance = hInstance;
    wcex.hIcon = hAppIcon;
    wcex.hIconSm = hAppIcon;
    wcex.lpszClassName = "SanTyperWindowClass";
    RegisterClassExA(&wcex);

    g_hWnd = CreateWindowExA(0, "SanTyperWindowClass", "SanTyper Background Service", 0, 0, 0, 0, 0, HWND_MESSAGE, NULL, hInstance, NULL);

    // 4. Setup System Tray icon
    memset(&nid, 0, sizeof(NOTIFYICONDATAA));
    nid.cbSize = sizeof(NOTIFYICONDATAA);
    nid.hWnd = g_hWnd;
    nid.uID = 1;
    nid.uFlags = NIF_ICON | NIF_MESSAGE | NIF_TIP | NIF_INFO;
    nid.uCallbackMessage = WM_TRAYICON;
    nid.hIcon = hAppIcon;
    strncpy(nid.szTip, "SanTyper Suite - Sanchitha Charunya", sizeof(nid.szTip) - 1);
    strncpy(nid.szInfo, "SanTyper Offline Suite is running! Press Ctrl+Alt+S or use tray menu.", sizeof(nid.szInfo) - 1);
    strncpy(nid.szInfoTitle, "SanTyper - Sanchitha Charunya", sizeof(nid.szInfoTitle) - 1);
    nid.dwInfoFlags = NIIF_INFO;
    Shell_NotifyIconA(NIM_ADD, &nid);

    // 5. Launch UI immediately based on command line arguments
    if (lpCmdLine && strstr(lpCmdLine, "--keyhelper")) {
        LaunchKeyHelper();
    } else {
        LaunchApp();
    }

    // 6. Run message loop
    MSG msg;
    while (GetMessageA(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessageA(&msg);
    }

    return (int)msg.wParam;
}
