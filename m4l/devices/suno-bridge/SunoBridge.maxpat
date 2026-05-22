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
		"description" : "Alfred M4L Suite — Suno Bridge",
		"digest" : "Download audio from a URL and import as a clip on a fresh track.",
		"tags" : "alfred suno download import utility",
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
					"patching_rect" : [ 30.0, 380.0, 80.0, 22.0 ],
					"text" : "plugin~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-3",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 0,
					"patching_rect" : [ 200.0, 380.0, 80.0, 22.0 ],
					"text" : "plugout~ 1 2"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-js",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"patching_rect" : [ 30.0, 250.0, 220.0, 22.0 ],
					"text" : "js suno_bridge.js"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-maxurl",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "", "", "" ],
					"patching_rect" : [ 350.0, 280.0, 180.0, 22.0 ],
					"text" : "maxurl @method get @writefile 1"
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
					"presentation_rect" : [ 10.0, 150.0, 480.0, 26.0 ],
					"parameter_enable" : 0,
					"text" : "Paste a URL and press PULL.",
					"patching_rect" : [ 200.0, 290.0, 200.0, 26.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-url-text",
					"maxclass" : "textedit",
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 50.0, 400.0, 26.0 ],
					"patching_rect" : [ 30.0, 100.0, 400.0, 26.0 ],
					"numinlets" : 1,
					"numoutlets" : 5,
					"outlettype" : [ "", "int", "", "", "" ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-url-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 30.0, 140.0, 80.0, 22.0 ],
					"text" : "prepend url"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-pull-btn",
					"maxclass" : "live.text",
					"mode" : 1,
					"text" : "PULL",
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 10.0, 200.0, 34.0 ],
					"bgcolor" : [ 0.2, 0.7, 0.3, 1.0 ],
					"activebgcolor" : [ 0.4, 1.0, 0.5, 1.0 ],
					"textcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"activetextcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"patching_rect" : [ 30.0, 200.0, 100.0, 30.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "pull_btn",
							"parameter_shortname" : "PULL",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-pull-msg",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 160.0, 200.0, 60.0, 22.0 ],
					"text" : "pull"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-view-menu",
					"maxclass" : "live.menu",
					"presentation" : 1,
					"presentation_rect" : [ 220.0, 14.0, 120.0, 20.0 ],
					"patching_rect" : [ 280.0, 200.0, 120.0, 20.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "view_menu",
							"parameter_shortname" : "View",
							"parameter_type" : 2,
							"parameter_enum" : [ "Arrangement", "Session" ],
							"parameter_mmax" : 1
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-view-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 280.0, 230.0, 80.0, 22.0 ],
					"text" : "prepend view"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-route-maxurl",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "", "", "" ],
					"patching_rect" : [ 350.0, 320.0, 240.0, 22.0 ],
					"text" : "route done error progress"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-done-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 350.0, 350.0, 130.0, 22.0 ],
					"text" : "prepend download_done"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-err-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 490.0, 350.0, 130.0, 22.0 ],
					"text" : "prepend download_error"
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
					"destination" : [ "obj-maxurl", 0 ],
					"source" : [ "obj-js", 2 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-url-prep", 0 ],
					"source" : [ "obj-url-text", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-url-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-pull-msg", 0 ],
					"source" : [ "obj-pull-btn", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-pull-msg", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-view-prep", 0 ],
					"source" : [ "obj-view-menu", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-view-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-route-maxurl", 0 ],
					"source" : [ "obj-maxurl", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-done-prep", 0 ],
					"source" : [ "obj-route-maxurl", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-err-prep", 0 ],
					"source" : [ "obj-route-maxurl", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-done-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-err-prep", 0 ]
				}

			}
 ],
		"dependency_cache" : [ 			{
				"name" : "suno_bridge.js",
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
