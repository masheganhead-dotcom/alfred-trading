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
		"description" : "Alfred M4L Suite — Float Mixer",
		"digest" : "A floating mixer window beside Live, Logic/Cubase style.",
		"tags" : "alfred mixer floating utility",
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
					"id" : "obj-thispatcher",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 30.0, 240.0, 90.0, 22.0 ],
					"text" : "thispatcher"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-js",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 30.0, 310.0, 220.0, 22.0 ],
					"text" : "js float_mixer.js"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-route-status",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 30.0, 340.0, 100.0, 22.0 ],
					"text" : "route status"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-status",
					"maxclass" : "live.text",
					"mode" : 0,
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 110.0, 400.0, 26.0 ],
					"parameter_enable" : 0,
					"text" : "Mixer hidden.",
					"patching_rect" : [ 200.0, 340.0, 300.0, 26.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-open-btn",
					"maxclass" : "live.text",
					"mode" : 1,
					"text" : "OPEN MIXER",
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 10.0, 200.0, 40.0 ],
					"bgcolor" : [ 0.3, 0.45, 0.8, 1.0 ],
					"activebgcolor" : [ 0.5, 0.65, 1.0, 1.0 ],
					"textcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"activetextcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"patching_rect" : [ 30.0, 80.0, 130.0, 30.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "open_btn",
							"parameter_shortname" : "OPEN",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-open-msgs",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 30.0, 130.0, 280.0, 22.0 ],
					"text" : "window flags float, window exec, window size 720 320, front"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-rebuild-msg",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 30.0, 160.0, 80.0, 22.0 ],
					"text" : "rebuild"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-close-btn",
					"maxclass" : "live.text",
					"mode" : 1,
					"text" : "Close",
					"presentation" : 1,
					"presentation_rect" : [ 220.0, 10.0, 70.0, 24.0 ],
					"patching_rect" : [ 180.0, 80.0, 70.0, 24.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "close_btn",
							"parameter_shortname" : "Close",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-close-msg",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 180.0, 130.0, 100.0, 22.0 ],
					"text" : "wclose"
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
					"id" : "obj-route-strip",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 260.0, 370.0, 100.0, 22.0 ],
					"text" : "route strip"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-strip-display",
					"maxclass" : "live.text",
					"mode" : 0,
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 150.0, 700.0, 100.0 ],
					"parameter_enable" : 0,
					"text" : "(strip data appears here — for the V1 build, this is a stand-in for the floating window's bpatcher; replace in Max with one [bpatcher] per strip)",
					"patching_rect" : [ 380.0, 370.0, 320.0, 60.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ]
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
					"destination" : [ "obj-route-strip", 0 ],
					"source" : [ "obj-js", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-strip-display", 0 ],
					"source" : [ "obj-route-strip", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-open-msgs", 0 ],
					"source" : [ "obj-open-btn", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-thispatcher", 0 ],
					"source" : [ "obj-open-msgs", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-rebuild-msg", 0 ],
					"source" : [ "obj-open-msgs", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-rebuild-msg", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-close-msg", 0 ],
					"source" : [ "obj-close-btn", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-thispatcher", 0 ],
					"source" : [ "obj-close-msg", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-rebuild-msg", 0 ],
					"source" : [ "obj-loadbang", 0 ]
				}

			}
 ],
		"dependency_cache" : [ 			{
				"name" : "float_mixer.js",
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
