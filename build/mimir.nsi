!define APP_NAME "Mimir Desktop"
!define COMP_NAME "cubeflix"
!define WEB_SITE "https://github.com/cubeflix"
!define VERSION "1.00.00.00"
!define COPYRIGHT "cubeflix � 2024"
!define DESCRIPTION "Mimir Desktop"
!define LICENSE_TXT "..\LICENSE"
!define INSTALLER_NAME "Mimir Desktop Installer.exe"
!define MAIN_APP_EXE "Mimir Desktop.exe"
!define INSTALL_TYPE "SetShellVarContext current"
!define REG_ROOT "HKCU"
!define REG_APP_PATH "Software\Microsoft\Windows\CurrentVersion\App Paths\${MAIN_APP_EXE}"
!define UNINSTALL_PATH "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"
!define ICON_PATH "..\resources\icon.ico"

######################################################################

VIProductVersion  "${VERSION}"
VIAddVersionKey "ProductName"  "${APP_NAME}"
VIAddVersionKey "CompanyName"  "${COMP_NAME}"
VIAddVersionKey "LegalCopyright"  "${COPYRIGHT}"
VIAddVersionKey "FileDescription"  "${DESCRIPTION}"
VIAddVersionKey "FileVersion"  "${VERSION}"

######################################################################

SetCompressor ZLIB
Name "${APP_NAME}"
Caption "${APP_NAME}"
OutFile "${INSTALLER_NAME}"
BrandingText "${APP_NAME}"
XPStyle on
InstallDirRegKey "${REG_ROOT}" "${REG_APP_PATH}" ""
InstallDir "$PROGRAMFILES\Mimir Desktop"

######################################################################

!include "MUI2.nsh"
!include "FileAssociation.nsh"

!define MUI_ABORTWARNING
!define MUI_UNABORTWARNING
!define MUI_ICON "${ICON_PATH}"
!define MUI_UNICON "${ICON_PATH}"
!define REG_START_MENU "Mimir Desktop"

!insertmacro MUI_PAGE_LICENSE "${LICENSE_TXT}"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

!ifdef REG_START_MENU
!define MUI_STARTMENUPAGE_NODISABLE
!define MUI_STARTMENUPAGE_DEFAULTFOLDER "Mimir Desktop"
!define MUI_STARTMENUPAGE_REGISTRY_ROOT "${REG_ROOT}"
!define MUI_STARTMENUPAGE_REGISTRY_KEY "${UNINSTALL_PATH}"
!define MUI_STARTMENUPAGE_REGISTRY_VALUENAME "${REG_START_MENU}"

Var SM_Folder

Function finishpageaction
CreateShortcut "$desktop\${APP_NAME}.lnk" "$instdir\${MAIN_APP_EXE}" "${ICON_PATH}"
FunctionEnd

!define MUI_FINISHPAGE_SHOWREADME ""
!define MUI_FINISHPAGE_SHOWREADME_NOTCHECKED
!define MUI_FINISHPAGE_SHOWREADME_TEXT "Create Desktop Shortcut"
!define MUI_FINISHPAGE_SHOWREADME_FUNCTION finishpageaction


# !insertmacro MUI_PAGE_STARTMENU 3 $startmenuFolder
!insertmacro MUI_PAGE_STARTMENU Application $SM_Folder

Section startmenu
${If} $SM_Folder != ""
    CreateDirectory "$SMPROGRAMS\$SM_Folder"
    CreateShortCut "$SMPROGRAMS\$SM_Folder\${APP_NAME}.lnk" "$INSTDIR\${MAIN_APP_EXE}"
${EndIf}
SectionEnd

!endif

!insertmacro MUI_PAGE_INSTFILES

!define MUI_FINISHPAGE_RUN "$INSTDIR\${MAIN_APP_EXE}"

!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM

!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "English"

######################################################################

Section -MainProgram
${INSTALL_TYPE}
SetOverwrite ifnewer
SetOutPath "$INSTDIR"

File "..\out\mimir-desktop-win32-x64\chrome_100_percent.pak"
File "..\out\mimir-desktop-win32-x64\chrome_200_percent.pak"
File "..\out\mimir-desktop-win32-x64\d3dcompiler_47.dll"
File "..\out\mimir-desktop-win32-x64\ffmpeg.dll"
File "..\out\mimir-desktop-win32-x64\icudtl.dat"
File "..\out\mimir-desktop-win32-x64\libEGL.dll"
File "..\out\mimir-desktop-win32-x64\libGLESv2.dll"
File "..\out\mimir-desktop-win32-x64\LICENSE"
File "..\out\mimir-desktop-win32-x64\LICENSES.chromium.html"
File "..\out\mimir-desktop-win32-x64\Mimir Desktop.exe"
File "..\out\mimir-desktop-win32-x64\resources.pak"
File "..\out\mimir-desktop-win32-x64\snapshot_blob.bin"
File "..\out\mimir-desktop-win32-x64\v8_context_snapshot.bin"
File "..\out\mimir-desktop-win32-x64\version"
File "..\out\mimir-desktop-win32-x64\vk_swiftshader.dll"
File "..\out\mimir-desktop-win32-x64\vk_swiftshader_icd.json"
File "..\out\mimir-desktop-win32-x64\vulkan-1.dll"
SetOutPath "$INSTDIR\resources"
File "..\out\mimir-desktop-win32-x64\resources\app.asar"
File "..\out\mimir-desktop-win32-x64\resources\icon.png"
SetOutPath "$INSTDIR\resources\win"
File "..\out\mimir-desktop-win32-x64\resources\win\wkhtmltopdf.exe"
SetOutPath "$INSTDIR\locales"
File "..\out\mimir-desktop-win32-x64\locales\af.pak"
File "..\out\mimir-desktop-win32-x64\locales\am.pak"
File "..\out\mimir-desktop-win32-x64\locales\ar.pak"
File "..\out\mimir-desktop-win32-x64\locales\bg.pak"
File "..\out\mimir-desktop-win32-x64\locales\bn.pak"
File "..\out\mimir-desktop-win32-x64\locales\ca.pak"
File "..\out\mimir-desktop-win32-x64\locales\cs.pak"
File "..\out\mimir-desktop-win32-x64\locales\da.pak"
File "..\out\mimir-desktop-win32-x64\locales\de.pak"
File "..\out\mimir-desktop-win32-x64\locales\el.pak"
File "..\out\mimir-desktop-win32-x64\locales\en-GB.pak"
File "..\out\mimir-desktop-win32-x64\locales\en-US.pak"
File "..\out\mimir-desktop-win32-x64\locales\es-419.pak"
File "..\out\mimir-desktop-win32-x64\locales\es.pak"
File "..\out\mimir-desktop-win32-x64\locales\et.pak"
File "..\out\mimir-desktop-win32-x64\locales\fa.pak"
File "..\out\mimir-desktop-win32-x64\locales\fi.pak"
File "..\out\mimir-desktop-win32-x64\locales\fil.pak"
File "..\out\mimir-desktop-win32-x64\locales\fr.pak"
File "..\out\mimir-desktop-win32-x64\locales\gu.pak"
File "..\out\mimir-desktop-win32-x64\locales\he.pak"
File "..\out\mimir-desktop-win32-x64\locales\hi.pak"
File "..\out\mimir-desktop-win32-x64\locales\hr.pak"
File "..\out\mimir-desktop-win32-x64\locales\hu.pak"
File "..\out\mimir-desktop-win32-x64\locales\id.pak"
File "..\out\mimir-desktop-win32-x64\locales\it.pak"
File "..\out\mimir-desktop-win32-x64\locales\ja.pak"
File "..\out\mimir-desktop-win32-x64\locales\kn.pak"
File "..\out\mimir-desktop-win32-x64\locales\ko.pak"
File "..\out\mimir-desktop-win32-x64\locales\lt.pak"
File "..\out\mimir-desktop-win32-x64\locales\lv.pak"
File "..\out\mimir-desktop-win32-x64\locales\ml.pak"
File "..\out\mimir-desktop-win32-x64\locales\mr.pak"
File "..\out\mimir-desktop-win32-x64\locales\ms.pak"
File "..\out\mimir-desktop-win32-x64\locales\nb.pak"
File "..\out\mimir-desktop-win32-x64\locales\nl.pak"
File "..\out\mimir-desktop-win32-x64\locales\pl.pak"
File "..\out\mimir-desktop-win32-x64\locales\pt-BR.pak"
File "..\out\mimir-desktop-win32-x64\locales\pt-PT.pak"
File "..\out\mimir-desktop-win32-x64\locales\ro.pak"
File "..\out\mimir-desktop-win32-x64\locales\ru.pak"
File "..\out\mimir-desktop-win32-x64\locales\sk.pak"
File "..\out\mimir-desktop-win32-x64\locales\sl.pak"
File "..\out\mimir-desktop-win32-x64\locales\sr.pak"
File "..\out\mimir-desktop-win32-x64\locales\sv.pak"
File "..\out\mimir-desktop-win32-x64\locales\sw.pak"
File "..\out\mimir-desktop-win32-x64\locales\ta.pak"
File "..\out\mimir-desktop-win32-x64\locales\te.pak"
File "..\out\mimir-desktop-win32-x64\locales\th.pak"
File "..\out\mimir-desktop-win32-x64\locales\tr.pak"
File "..\out\mimir-desktop-win32-x64\locales\uk.pak"
File "..\out\mimir-desktop-win32-x64\locales\ur.pak"
File "..\out\mimir-desktop-win32-x64\locales\vi.pak"
File "..\out\mimir-desktop-win32-x64\locales\zh-CN.pak"
File "..\out\mimir-desktop-win32-x64\locales\zh-TW.pak"

SectionEnd

######################################################################

Section -Icons_Reg
SetOutPath "$INSTDIR"
WriteUninstaller "$INSTDIR\uninstall.exe"

# !ifdef REG_START_MENU
# !insertmacro MUI_STARTMENU_WRITE_BEGIN Application
# CreateDirectory "$SMPROGRAMS\$SM_Folder"
# CreateShortCut "$SMPROGRAMS\$SM_Folder\${APP_NAME}.lnk" "$INSTDIR\${MAIN_APP_EXE}"
# CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${MAIN_APP_EXE}"
# !ifdef WEB_SITE
# WriteIniStr "$INSTDIR\${APP_NAME} website.url" "InternetShortcut" "URL" "${WEB_SITE}"
# CreateShortCut "$SMPROGRAMS\$SM_Folder\${APP_NAME} Website.lnk" "$INSTDIR\${APP_NAME} website.url"
# !endif
# !insertmacro MUI_STARTMENU_WRITE_END
# !endif
# 
# !ifndef REG_START_MENU
# CreateDirectory "$SMPROGRAMS\Mimir Desktop"
# CreateShortCut "$SMPROGRAMS\Mimir Desktop\${APP_NAME}.lnk" "$INSTDIR\${MAIN_APP_EXE}"
# CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${MAIN_APP_EXE}"
# !ifdef WEB_SITE
# WriteIniStr "$INSTDIR\${APP_NAME} website.url" "InternetShortcut" "URL" "${WEB_SITE}"
# CreateShortCut "$SMPROGRAMS\Mimir Desktop\${APP_NAME} Website.lnk" "$INSTDIR\${APP_NAME} website.url"
# !endif
# !endif

WriteRegStr ${REG_ROOT} "${REG_APP_PATH}" "" "$INSTDIR\${MAIN_APP_EXE}"
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "DisplayName" "${APP_NAME}"
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "UninstallString" "$INSTDIR\uninstall.exe"
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "DisplayIcon" "$INSTDIR\${MAIN_APP_EXE}"
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "DisplayVersion" "${VERSION}"
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "Publisher" "${COMP_NAME}"

!ifdef WEB_SITE
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "URLInfoAbout" "${WEB_SITE}"
!endif

${registerExtension} "$INSTDIR\${MAIN_APP_EXE}" ".mimir" "Mimir Document"
SectionEnd

######################################################################

Section Uninstall
${INSTALL_TYPE}
Delete "$INSTDIR\chrome_100_percent.pak"
Delete "$INSTDIR\chrome_200_percent.pak"
Delete "$INSTDIR\d3dcompiler_47.dll"
Delete "$INSTDIR\ffmpeg.dll"
Delete "$INSTDIR\icudtl.dat"
Delete "$INSTDIR\libEGL.dll"
Delete "$INSTDIR\libGLESv2.dll"
Delete "$INSTDIR\LICENSE"
Delete "$INSTDIR\LICENSES.chromium.html"
Delete "$INSTDIR\Mimir Desktop.exe"
Delete "$INSTDIR\resources.pak"
Delete "$INSTDIR\snapshot_blob.bin"
Delete "$INSTDIR\v8_context_snapshot.bin"
Delete "$INSTDIR\version"
Delete "$INSTDIR\vk_swiftshader.dll"
Delete "$INSTDIR\vk_swiftshader_icd.json"
Delete "$INSTDIR\vulkan-1.dll"
Delete "$INSTDIR\resources\app.asar"
Delete "$INSTDIR\resources\icon.png"
Delete "$INSTDIR\resources\win\wkhtmltopdf.exe"
Delete "$INSTDIR\locales\af.pak"
Delete "$INSTDIR\locales\am.pak"
Delete "$INSTDIR\locales\ar.pak"
Delete "$INSTDIR\locales\bg.pak"
Delete "$INSTDIR\locales\bn.pak"
Delete "$INSTDIR\locales\ca.pak"
Delete "$INSTDIR\locales\cs.pak"
Delete "$INSTDIR\locales\da.pak"
Delete "$INSTDIR\locales\de.pak"
Delete "$INSTDIR\locales\el.pak"
Delete "$INSTDIR\locales\en-GB.pak"
Delete "$INSTDIR\locales\en-US.pak"
Delete "$INSTDIR\locales\es-419.pak"
Delete "$INSTDIR\locales\es.pak"
Delete "$INSTDIR\locales\et.pak"
Delete "$INSTDIR\locales\fa.pak"
Delete "$INSTDIR\locales\fi.pak"
Delete "$INSTDIR\locales\fil.pak"
Delete "$INSTDIR\locales\fr.pak"
Delete "$INSTDIR\locales\gu.pak"
Delete "$INSTDIR\locales\he.pak"
Delete "$INSTDIR\locales\hi.pak"
Delete "$INSTDIR\locales\hr.pak"
Delete "$INSTDIR\locales\hu.pak"
Delete "$INSTDIR\locales\id.pak"
Delete "$INSTDIR\locales\it.pak"
Delete "$INSTDIR\locales\ja.pak"
Delete "$INSTDIR\locales\kn.pak"
Delete "$INSTDIR\locales\ko.pak"
Delete "$INSTDIR\locales\lt.pak"
Delete "$INSTDIR\locales\lv.pak"
Delete "$INSTDIR\locales\ml.pak"
Delete "$INSTDIR\locales\mr.pak"
Delete "$INSTDIR\locales\ms.pak"
Delete "$INSTDIR\locales\nb.pak"
Delete "$INSTDIR\locales\nl.pak"
Delete "$INSTDIR\locales\pl.pak"
Delete "$INSTDIR\locales\pt-BR.pak"
Delete "$INSTDIR\locales\pt-PT.pak"
Delete "$INSTDIR\locales\ro.pak"
Delete "$INSTDIR\locales\ru.pak"
Delete "$INSTDIR\locales\sk.pak"
Delete "$INSTDIR\locales\sl.pak"
Delete "$INSTDIR\locales\sr.pak"
Delete "$INSTDIR\locales\sv.pak"
Delete "$INSTDIR\locales\sw.pak"
Delete "$INSTDIR\locales\ta.pak"
Delete "$INSTDIR\locales\te.pak"
Delete "$INSTDIR\locales\th.pak"
Delete "$INSTDIR\locales\tr.pak"
Delete "$INSTDIR\locales\uk.pak"
Delete "$INSTDIR\locales\ur.pak"
Delete "$INSTDIR\locales\vi.pak"
Delete "$INSTDIR\locales\zh-CN.pak"
Delete "$INSTDIR\locales\zh-TW.pak"
 
RmDir "$INSTDIR\locales"
RmDir "$INSTDIR\resources\win"
RmDir "$INSTDIR\resources"
 
Delete "$INSTDIR\uninstall.exe"
!ifdef WEB_SITE
Delete "$INSTDIR\${APP_NAME} website.url"
!endif

RmDir "$INSTDIR"

!ifdef REG_START_MENU
!insertmacro MUI_STARTMENU_GETFOLDER "Application" $SM_Folder
Delete "$SMPROGRAMS\$SM_Folder\${APP_NAME}.lnk"
!ifdef WEB_SITE
Delete "$SMPROGRAMS\$SM_Folder\${APP_NAME} Website.lnk"
!endif
Delete "$DESKTOP\${APP_NAME}.lnk"

RmDir "$SMPROGRAMS\$SM_Folder"
!endif

!ifndef REG_START_MENU
Delete "$SMPROGRAMS\Mimir Desktop\${APP_NAME}.lnk"
!ifdef WEB_SITE
Delete "$SMPROGRAMS\Mimir Desktop\${APP_NAME} Website.lnk"
!endif
Delete "$DESKTOP\${APP_NAME}.lnk"

RmDir "$SMPROGRAMS\Mimir Desktop"
!endif

DeleteRegKey ${REG_ROOT} "${REG_APP_PATH}"
DeleteRegKey ${REG_ROOT} "${UNINSTALL_PATH}"
${unregisterExtension} ".mimir" "Mimir Document"
SectionEnd

######################################################################

