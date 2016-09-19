$APP_TITLE="LabCorp Phoenix"
$PHOENIX =  @ProgramFilesDir & "\LabCorp Phoenix\_phoenix.exe"
$PHOENIX_RESOURCES =  @ProgramFilesDir & "\LabCorp Phoenix\resources\config.json"

#include <FileConstants.au3>
#include <Excel.au3>
#include <GUIConstantsEx.au3>
#include <Array.au3>
#include <File.au3>

AskEnvironment()


Func printConfig($environment)
   Local $file = FileOpen($PHOENIX_RESOURCES, 2)

   If $file = -1 Then
	  MsgBox(0, "Error", "Unable to open file.")
   Else
	  FileWrite($file, '{' & @CRLF)
	  FileWrite($file, '	"MY_CUSTOM_URL": "'& $environment &'",' & @CRLF)
	  FileWrite($file, '	"startingEnvironment": "MY_CUSTOM_URL"' & @CRLF)
	  FileWrite($file, '}')
	  FileClose($file)
   EndIf

EndFunc   ;==>printConfig

Func getVariable($idComboBox)
   $sName = GUICtrlRead($idComboBox)
   $iIndex = _ArraySearch($aArray, $sName)
   If Not @error Then
	  Return $aArray[$iIndex][1]
   EndIf

Return ""
EndFunc   ;==>printConfig


Func AskEnvironment()
   Global $aInput
   Global $aArray[8][2] = [["STAGE", "https://stage-phoenix.labcorp.com/web-ui/"], ["UAT", "https://uat-phoenix.labcorp.com/web-ui/"], ["PROD", "https://phoenix.labcorp.com/web-ui/"],["QA", "https://qa-phoenix.labcorp.com/web-ui/"],["DEV1", "http://dev1-phoenix.labcorp.com/web-ui/"],["DEV2", "http://dev2-phoenix.labcorp.com/web-ui/"],["DEV", "https://dev3-phoenix.labcorp.com/web-ui/"],["DEV", "https://dev4-phoenix.labcorp.com/web-ui/"]]

   _FileReadToArray("environments.txt", $aInput)

   ; Create the multidimensional array with the given information
   For $i = 1 to UBound($aInput) -1
	  $ENV = StringSplit( $aInput[$i], ",")
	  Local $temp[1][2] = [[$ENV[1], $ENV[2]]]

	  $iIndex = _ArraySearch($aArray, $ENV[1])

	  If $iIndex > 0 Then
 		 ;MsgBox (0,'IF',$iIndex)
		 $aArray[$iIndex][1] = $ENV[2]
		 ;_ArrayDisplay($temp, "2D Array")
		 ;MsgBox($MB_SYSTEMMODAL, "IF", _ArrayToString($temp, " :: ", 4, 7, @CRLF, 2, 5))
	  ElseIf $iIndex < 0 Then
		 _ArrayAdd($aArray, $temp)
		 ;_ArrayDisplay($aArray, "2D Array")
		 ;MsgBox($MB_SYSTEMMODAL, "ELSE:"&$iIndex&":", _ArrayToString($aArray, " :: ", 4, 7, @CRLF, 2, 5))

	  EndIf

   Next

;  	  _ArrayDisplay($aArray, "2D Array")
;	  MsgBox($MB_SYSTEMMODAL, "Rows 4-7,  cols 2-5", _ArrayToString($aArray, " :: ", 4, 7, @CRLF, 2, 5))

   ; And here we get the elements into a list
   $sList = ""
   For $i = 0 To UBound($aArray,1) -1
	  $sList &= "|" & $aArray[$i][0]
   Next

   ; Create a GUI with various controls.
   Local $hGUI = GUICreate($APP_TITLE, 300, 100)

   ; Create a combobox control.
   Local $idComboBox = GUICtrlCreateCombo("PROD", 10, 10, 185, 20)
   Local $idClose = GUICtrlCreateButton("Start", 210, 70, 85, 25)


   ; Add additional items to the combobox.
   GUICtrlSetData($idComboBox, $sList, "PROD")

   ; Display the GUI.
   GUISetState(@SW_SHOW, $hGUI)

   ; Create label
   $hLabel = GUICtrlCreateLabel("", 10, 40, 300, 20)

   Local $sComboRead = ""


   ; Define the PROD default
   $iIndex = _ArraySearch($aArray, "PROD")
   GUICtrlSetData($hLabel, $aArray[$iIndex][1])

   ; Loop until the user exits.
   While 1
	  Switch GUIGetMsg()
		 Case $idClose
			;write to file
			$sName = getVariable($idComboBox)
			printConfig($sName)
			; launch the application
			run($PHOENIX)
			ExitLoop
		 Case $GUI_EVENT_CLOSE
			ExitLoop
		 Case $idComboBox
			$sName = getVariable($idComboBox)
            GUICtrlSetData($hLabel,$sName)
		 EndSwitch
	  WEnd

   ; Delete the previous GUI and all controls.
   GUIDelete($hGUI)
EndFunc   ;==>AskEnvironment