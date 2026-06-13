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
		"rect" : [ 100.0, 100.0, 760.0, 460.0 ],
		"bglocked" : 0,
		"openinpresentation" : 1,
		"default_fontsize" : 12.0,
		"default_fontface" : 0,
		"default_fontname" : "Arial",
		"gridonopen" : 1,
		"gridsize" : [ 15.0, 15.0 ],
		"gridsnaponopen" : 1,
		"objectsnaponopen" : 1,
		"description" : "Alfred M4L Suite — Session Cleaner",
		"digest" : "Scan + clean a Live set: empty tracks, muted clips, inactive devices.",
		"tags" : "alfred cleaner declutter utility",
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
					"patching_rect" : [ 30.0, 400.0, 80.0, 22.0 ],
					"text" : "plugin~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-3",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 0,
					"patching_rect" : [ 200.0, 400.0, 80.0, 22.0 ],
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
					"patching_rect" : [ 30.0, 340.0, 220.0, 22.0 ],
					"text" : "js session_cleaner.js"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-route-status",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 30.0, 370.0, 100.0, 22.0 ],
					"text" : "route status"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-status",
					"maxclass" : "live.text",
					"mode" : 0,
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 210.0, 560.0, 26.0 ],
					"parameter_enable" : 0,
					"text" : "Idle. Press SCAN to preview, CLEAN to commit.",
					"patching_rect" : [ 200.0, 370.0, 300.0, 26.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-scan-btn",
					"maxclass" : "live.text",
					"mode" : 1,
					"text" : "SCAN",
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 10.0, 130.0, 50.0 ],
					"bgcolor" : [ 0.2, 0.5, 0.9, 1.0 ],
					"activebgcolor" : [ 0.4, 0.7, 1.0, 1.0 ],
					"textcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"activetextcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"patching_rect" : [ 30.0, 80.0, 100.0, 30.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "scan_btn",
							"parameter_shortname" : "SCAN",
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
					"patching_rect" : [ 150.0, 80.0, 60.0, 22.0 ],
					"text" : "scan"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-clean-btn",
					"maxclass" : "live.text",
					"mode" : 1,
					"text" : "CLEAN",
					"presentation" : 1,
					"presentation_rect" : [ 150.0, 10.0, 130.0, 50.0 ],
					"bgcolor" : [ 0.7, 0.15, 0.15, 1.0 ],
					"activebgcolor" : [ 1.0, 0.2, 0.2, 1.0 ],
					"textcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"activetextcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"patching_rect" : [ 30.0, 130.0, 100.0, 30.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "clean_btn",
							"parameter_shortname" : "CLEAN",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-clean-msg",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 150.0, 130.0, 60.0, 22.0 ],
					"text" : "clean"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-cat-empty",
					"maxclass" : "live.toggle",
					"presentation" : 1,
					"presentation_rect" : [ 300.0, 10.0, 24.0, 24.0 ],
					"patching_rect" : [ 300.0, 80.0, 24.0, 24.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "cat_empty",
							"parameter_shortname" : "Empty",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ],
							"parameter_initial_enable" : 1,
							"parameter_initial" : [ 1 ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-cat-empty-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 300.0, 110.0, 150.0, 22.0 ],
					"text" : "prepend cat empty_tracks"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-cat-muted",
					"maxclass" : "live.toggle",
					"presentation" : 1,
					"presentation_rect" : [ 330.0, 10.0, 24.0, 24.0 ],
					"patching_rect" : [ 330.0, 80.0, 24.0, 24.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "cat_muted",
							"parameter_shortname" : "MuteT",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-cat-muted-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 330.0, 140.0, 150.0, 22.0 ],
					"text" : "prepend cat muted_tracks"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-cat-clips",
					"maxclass" : "live.toggle",
					"presentation" : 1,
					"presentation_rect" : [ 360.0, 10.0, 24.0, 24.0 ],
					"patching_rect" : [ 360.0, 80.0, 24.0, 24.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "cat_clips",
							"parameter_shortname" : "MuteC",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ],
							"parameter_initial_enable" : 1,
							"parameter_initial" : [ 1 ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-cat-clips-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 360.0, 170.0, 150.0, 22.0 ],
					"text" : "prepend cat muted_clips"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-cat-devices",
					"maxclass" : "live.toggle",
					"presentation" : 1,
					"presentation_rect" : [ 390.0, 10.0, 24.0, 24.0 ],
					"patching_rect" : [ 390.0, 80.0, 24.0, 24.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "cat_devices",
							"parameter_shortname" : "Devs",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ],
							"parameter_initial_enable" : 1,
							"parameter_initial" : [ 1 ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-cat-devices-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 390.0, 200.0, 180.0, 22.0 ],
					"text" : "prepend cat inactive_devices"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-cat-returns",
					"maxclass" : "live.toggle",
					"presentation" : 1,
					"presentation_rect" : [ 420.0, 10.0, 24.0, 24.0 ],
					"patching_rect" : [ 420.0, 80.0, 24.0, 24.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "cat_returns",
							"parameter_shortname" : "Ret",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-cat-returns-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 420.0, 230.0, 160.0, 22.0 ],
					"text" : "prepend cat empty_returns"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-scope-menu",
					"maxclass" : "live.menu",
					"presentation" : 1,
					"presentation_rect" : [ 460.0, 10.0, 110.0, 20.0 ],
					"patching_rect" : [ 460.0, 80.0, 110.0, 20.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "scope_menu",
							"parameter_shortname" : "Scope",
							"parameter_type" : 2,
							"parameter_enum" : [ "Session", "Arrangement", "Both" ],
							"parameter_mmax" : 2,
							"parameter_initial_enable" : 1,
							"parameter_initial" : [ 2 ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-scope-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 460.0, 110.0, 90.0, 22.0 ],
					"text" : "prepend scope"
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
					"destination" : [ "obj-route-status", 0 ],
					"source" : [ "obj-js", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-status", 0 ],
					"source" : [ "obj-route-status", 0 ]
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
					"destination" : [ "obj-clean-msg", 0 ],
					"source" : [ "obj-clean-btn", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-clean-msg", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-cat-empty-prep", 0 ],
					"source" : [ "obj-cat-empty", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-cat-empty-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-cat-muted-prep", 0 ],
					"source" : [ "obj-cat-muted", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-cat-muted-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-cat-clips-prep", 0 ],
					"source" : [ "obj-cat-clips", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-cat-clips-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-cat-devices-prep", 0 ],
					"source" : [ "obj-cat-devices", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-cat-devices-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-cat-returns-prep", 0 ],
					"source" : [ "obj-cat-returns", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-cat-returns-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-scope-prep", 0 ],
					"source" : [ "obj-scope-menu", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-scope-prep", 0 ]
				}

			}
 ],
		"dependency_cache" : [ 			{
				"name" : "session_cleaner.js",
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
