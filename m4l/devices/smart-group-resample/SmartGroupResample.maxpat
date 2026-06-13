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
		"description" : "Alfred M4L Suite — Smart Group Resample",
		"digest" : "Bounce a Group track to a single audio clip on a new track.",
		"tags" : "alfred resample bounce freeze utility",
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
					"patching_rect" : [ 30.0, 360.0, 80.0, 22.0 ],
					"text" : "plugin~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-3",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 0,
					"patching_rect" : [ 200.0, 360.0, 80.0, 22.0 ],
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
					"patching_rect" : [ 30.0, 270.0, 240.0, 22.0 ],
					"text" : "js smart_group_resample.js"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-route-status",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 30.0, 310.0, 100.0, 22.0 ],
					"text" : "route status"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-status-display",
					"maxclass" : "live.text",
					"mode" : 0,
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 130.0, 400.0, 26.0 ],
					"parameter_enable" : 0,
					"text" : "Idle.",
					"patching_rect" : [ 280.0, 310.0, 200.0, 26.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-prep-btn",
					"maxclass" : "live.text",
					"mode" : 1,
					"text" : "PREP",
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 10.0, 120.0, 50.0 ],
					"bgcolor" : [ 0.2, 0.5, 0.9, 1.0 ],
					"activebgcolor" : [ 0.4, 0.7, 1.0, 1.0 ],
					"textcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"activetextcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"patching_rect" : [ 30.0, 110.0, 70.0, 30.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "prep_btn",
							"parameter_shortname" : "PREP",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-prep-msg",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 140.0, 110.0, 50.0, 22.0 ],
					"text" : "prep"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-capture-btn",
					"maxclass" : "live.text",
					"mode" : 1,
					"text" : "CAPTURE",
					"presentation" : 1,
					"presentation_rect" : [ 140.0, 10.0, 120.0, 50.0 ],
					"bgcolor" : [ 0.7, 0.15, 0.15, 1.0 ],
					"activebgcolor" : [ 1.0, 0.2, 0.2, 1.0 ],
					"textcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"activetextcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"patching_rect" : [ 30.0, 160.0, 90.0, 30.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "capture_btn",
							"parameter_shortname" : "CAPTURE",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-capture-msg",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 140.0, 160.0, 70.0, 22.0 ],
					"text" : "capture"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-tap-menu",
					"maxclass" : "live.menu",
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 70.0, 120.0, 20.0 ],
					"patching_rect" : [ 280.0, 110.0, 120.0, 20.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "tap_menu",
							"parameter_shortname" : "Tap",
							"parameter_type" : 2,
							"parameter_enum" : [ "Pre FX", "Post FX" ],
							"parameter_mmax" : 1,
							"parameter_initial_enable" : 1,
							"parameter_initial" : [ 1 ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-tap-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 280.0, 140.0, 80.0, 22.0 ],
					"text" : "prepend tap"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-mute-toggle",
					"maxclass" : "live.toggle",
					"presentation" : 1,
					"presentation_rect" : [ 140.0, 70.0, 24.0, 24.0 ],
					"patching_rect" : [ 280.0, 180.0, 24.0, 24.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "mute_src",
							"parameter_shortname" : "MuteSrc",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-mute-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 280.0, 210.0, 100.0, 22.0 ],
					"text" : "prepend mute_src"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-len-numbox",
					"maxclass" : "live.numbox",
					"presentation" : 1,
					"presentation_rect" : [ 180.0, 70.0, 60.0, 20.0 ],
					"patching_rect" : [ 420.0, 110.0, 60.0, 20.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "length_bars",
							"parameter_shortname" : "Bars",
							"parameter_type" : 1,
							"parameter_mmax" : 128.0,
							"parameter_unitstyle" : 0
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-len-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 420.0, 140.0, 90.0, 22.0 ],
					"text" : "prepend length"
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
					"destination" : [ "obj-status-display", 0 ],
					"source" : [ "obj-route-status", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-prep-msg", 0 ],
					"source" : [ "obj-prep-btn", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-prep-msg", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-capture-msg", 0 ],
					"source" : [ "obj-capture-btn", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-capture-msg", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-tap-prep", 0 ],
					"source" : [ "obj-tap-menu", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-tap-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-mute-prep", 0 ],
					"source" : [ "obj-mute-toggle", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-mute-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-len-prep", 0 ],
					"source" : [ "obj-len-numbox", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-len-prep", 0 ]
				}

			}
 ],
		"dependency_cache" : [ 			{
				"name" : "smart_group_resample.js",
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
