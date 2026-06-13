{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 8,
			"minor" : 5,
			"revision" : 5,
			"architecture" : "x64",
			"modernui" : 1
		}
,
		"classnamespace" : "box",
		"rect" : [ 100.0, 100.0, 720.0, 420.0 ],
		"bglocked" : 0,
		"openinpresentation" : 1,
		"default_fontsize" : 12.0,
		"default_fontface" : 0,
		"default_fontname" : "Arial",
		"gridonopen" : 1,
		"gridsize" : [ 15.0, 15.0 ],
		"gridsnaponopen" : 1,
		"objectsnaponopen" : 1,
		"statusbarvisible" : 2,
		"toolbarvisible" : 1,
		"lefttoolbarpinned" : 0,
		"toptoolbarpinned" : 0,
		"righttoolbarpinned" : 0,
		"bottomtoolbarpinned" : 0,
		"toolbars_unpinned_last_save" : 0,
		"tallnewobj" : 0,
		"boxanimatetime" : 200,
		"enablehscroll" : 1,
		"enablevscroll" : 1,
		"devicewidth" : 0.0,
		"description" : "Alfred M4L Suite — System Audio Capture",
		"digest" : "One-click record of system audio onto a fresh Live audio track.",
		"tags" : "alfred capture record utility",
		"style" : "",
		"subpatcher_template" : "",
		"assistshowspatchername" : 0,
		"boxes" : [ 			{
				"box" : 				{
					"id" : "obj-1",
					"maxclass" : "newobj",
					"numinlets" : 0,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 30.0, 30.0, 100.0, 22.0 ],
					"text" : "live.thisdevice"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-2",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 2,
					"outlettype" : [ "signal", "signal" ],
					"patching_rect" : [ 30.0, 350.0, 80.0, 22.0 ],
					"text" : "plugin~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-3",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 0,
					"patching_rect" : [ 200.0, 350.0, 80.0, 22.0 ],
					"text" : "plugout~ 1 2"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-js",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 30.0, 250.0, 220.0, 22.0 ],
					"text" : "js system_audio_capture.js"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-loadbang",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"patching_rect" : [ 30.0, 60.0, 60.0, 22.0 ],
					"text" : "loadbang"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-route-status",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 30.0, 290.0, 100.0, 22.0 ],
					"text" : "route status"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-status-display",
					"maxclass" : "live.text",
					"mode" : 0,
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 80.0, 400.0, 26.0 ],
					"parameter_enable" : 0,
					"text" : "Loading…",
					"varname" : "status_display",
					"patching_rect" : [ 280.0, 290.0, 200.0, 26.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"id" : "obj-status-display"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-rec-btn",
					"maxclass" : "live.text",
					"mode" : 1,
					"text" : "REC",
					"activebgcolor" : [ 1.0, 0.2, 0.2, 1.0 ],
					"bgcolor" : [ 0.7, 0.15, 0.15, 1.0 ],
					"textcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"activetextcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 10.0, 200.0, 60.0 ],
					"patching_rect" : [ 30.0, 150.0, 80.0, 30.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"varname" : "rec_btn",
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "rec_btn",
							"parameter_shortname" : "REC",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-rec-msg",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 150.0, 150.0, 50.0, 22.0 ],
					"text" : "rec"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-scan-btn",
					"maxclass" : "live.text",
					"mode" : 1,
					"text" : "Scan",
					"presentation" : 1,
					"presentation_rect" : [ 220.0, 10.0, 70.0, 26.0 ],
					"patching_rect" : [ 30.0, 100.0, 60.0, 22.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"varname" : "scan_btn",
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "scan_btn",
							"parameter_shortname" : "Scan",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-scan-msg",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 150.0, 100.0, 60.0, 22.0 ],
					"text" : "scan"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-mode-menu",
					"maxclass" : "live.menu",
					"presentation" : 1,
					"presentation_rect" : [ 220.0, 50.0, 120.0, 20.0 ],
					"patching_rect" : [ 280.0, 150.0, 120.0, 20.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "mode_menu",
							"parameter_shortname" : "Mode",
							"parameter_type" : 2,
							"parameter_enum" : [ "Session", "Arrangement" ],
							"parameter_mmax" : 1
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-mode-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 280.0, 190.0, 80.0, 22.0 ],
					"text" : "prepend mode"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-autostop-dial",
					"maxclass" : "live.dial",
					"presentation" : 1,
					"presentation_rect" : [ 220.0, 80.0, 50.0, 50.0 ],
					"patching_rect" : [ 420.0, 100.0, 50.0, 50.0 ],
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "float" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "auto_stop_sec",
							"parameter_shortname" : "AutoStop",
							"parameter_type" : 0,
							"parameter_mmax" : 600.0,
							"parameter_unitstyle" : 0
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-autostop-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 420.0, 160.0, 100.0, 22.0 ],
					"text" : "prepend auto_stop"
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-3", 0 ],
					"source" : [ "obj-2", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-3", 1 ],
					"source" : [ "obj-2", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-loadbang", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-route-status", 0 ],
					"source" : [ "obj-js", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-status-display", 0 ],
					"source" : [ "obj-route-status", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-rec-msg", 0 ],
					"source" : [ "obj-rec-btn", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-rec-msg", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-scan-msg", 0 ],
					"source" : [ "obj-scan-btn", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-scan-msg", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-mode-prep", 0 ],
					"source" : [ "obj-mode-menu", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-mode-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-autostop-prep", 0 ],
					"source" : [ "obj-autostop-dial", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-autostop-prep", 0 ]
				}

			}
 ],
		"dependency_cache" : [ 			{
				"name" : "system_audio_capture.js",
				"bootpath" : "~/Documents/Max 8/Library/alfred-m4l",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "alfred-liveapi.js",
				"bootpath" : "~/Documents/Max 8/Library/alfred-m4l",
				"type" : "TEXT",
				"implicit" : 1
			}
 ],
		"autosave" : 0
	}

}
