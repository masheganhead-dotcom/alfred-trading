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
		"rect" : [ 100.0, 100.0, 880.0, 540.0 ],
		"bglocked" : 0,
		"openinpresentation" : 1,
		"default_fontsize" : 12.0,
		"default_fontface" : 0,
		"default_fontname" : "Arial",
		"gridonopen" : 1,
		"gridsize" : [ 15.0, 15.0 ],
		"gridsnaponopen" : 1,
		"objectsnaponopen" : 1,
		"description" : "Alfred Shader — audio-reactive visualizer with curated art-grade presets.",
		"digest" : "Floating audio-reactive visualizer. Phase A: Liquid Chrome / Audio Blob / VHS Glitch.",
		"tags" : "alfred shader visualizer audio-reactive jitter",
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
					"id" : "obj-plugin",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 2,
					"outlettype" : [ "signal", "signal" ],
					"patching_rect" : [ 30.0, 470.0, 80.0, 22.0 ],
					"text" : "plugin~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-plugout",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 0,
					"patching_rect" : [ 150.0, 500.0, 80.0, 22.0 ],
					"text" : "plugout~ 1 2"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-mix",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 30.0, 360.0, 40.0, 22.0 ],
					"text" : "+~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-norm",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 30.0, 390.0, 50.0, 22.0 ],
					"text" : "*~ 0.5"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-peakamp",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 100.0, 350.0, 80.0, 22.0 ],
					"text" : "peakamp~ 30"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-peak-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 100.0, 380.0, 80.0, 22.0 ],
					"text" : "prepend peak"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-lp-bass",
					"maxclass" : "newobj",
					"numinlets" : 3,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 200.0, 350.0, 110.0, 22.0 ],
					"text" : "lores~ 250 0.7"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-lp-mid",
					"maxclass" : "newobj",
					"numinlets" : 3,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 320.0, 350.0, 130.0, 22.0 ],
					"text" : "lores~ 2500 0.7"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-mid-sub",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 320.0, 380.0, 40.0, 22.0 ],
					"text" : "-~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-treb-sub",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 440.0, 380.0, 40.0, 22.0 ],
					"text" : "-~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-bass-avg",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 200.0, 410.0, 100.0, 22.0 ],
					"text" : "average~ 1024 rms"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-bass-snap",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 200.0, 440.0, 90.0, 22.0 ],
					"text" : "snapshot~ 33"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-bass-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 200.0, 470.0, 90.0, 22.0 ],
					"text" : "prepend bass"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-mid-avg",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 320.0, 410.0, 100.0, 22.0 ],
					"text" : "average~ 1024 rms"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-mid-snap",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 320.0, 440.0, 90.0, 22.0 ],
					"text" : "snapshot~ 33"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-mid-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 320.0, 470.0, 80.0, 22.0 ],
					"text" : "prepend mid"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-treb-avg",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 440.0, 410.0, 100.0, 22.0 ],
					"text" : "average~ 1024 rms"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-treb-snap",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 440.0, 440.0, 90.0, 22.0 ],
					"text" : "snapshot~ 33"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-treb-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 440.0, 470.0, 100.0, 22.0 ],
					"text" : "prepend treble"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-rms-avg",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 560.0, 410.0, 110.0, 22.0 ],
					"text" : "average~ 4096 rms"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-rms-snap",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 560.0, 440.0, 90.0, 22.0 ],
					"text" : "snapshot~ 50"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-rms-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 560.0, 470.0, 80.0, 22.0 ],
					"text" : "prepend rms"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-js",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 30.0, 250.0, 200.0, 22.0 ],
					"text" : "js alfred_shader.js"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-route-jit",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"patching_rect" : [ 260.0, 280.0, 140.0, 22.0 ],
					"text" : "route param file shader"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-shader-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 320.0, 310.0, 70.0, 22.0 ],
					"text" : "prepend shader"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-param-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 260.0, 310.0, 60.0, 22.0 ],
					"text" : "prepend param"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-metro",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"patching_rect" : [ 30.0, 200.0, 70.0, 22.0 ],
					"text" : "metro 33"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-tick-msg",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 120.0, 200.0, 50.0, 22.0 ],
					"text" : "tick"
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
					"id" : "obj-init-metro",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 30.0, 100.0, 40.0, 22.0 ],
					"text" : "1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-open-btn",
					"maxclass" : "live.text",
					"mode" : 1,
					"text" : "OPEN VISUAL",
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 10.0, 200.0, 40.0 ],
					"bgcolor" : [ 0.3, 0.45, 0.8, 1.0 ],
					"activebgcolor" : [ 0.5, 0.65, 1.0, 1.0 ],
					"textcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"activetextcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"patching_rect" : [ 30.0, 130.0, 130.0, 30.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"varname" : "open_btn",
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
					"patching_rect" : [ 180.0, 130.0, 220.0, 22.0 ],
					"text" : "create, fullscreen 0, dim 1280 720, front"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-world",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 420.0, 200.0, 300.0, 22.0 ],
					"text" : "jit.world alfshader @floating 1 @sync 1 @fsaa 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-vplane",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 420.0, 240.0, 370.0, 22.0 ],
					"text" : "jit.gl.videoplane alfshader @transform_reset 2 @shader shaders/liquid-chrome.jxs"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-preset-menu",
					"maxclass" : "live.menu",
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 60.0, 200.0, 22.0 ],
					"patching_rect" : [ 420.0, 100.0, 200.0, 22.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "preset_menu",
							"parameter_shortname" : "Preset",
							"parameter_type" : 2,
							"parameter_enum" : [ "Liquid Chrome", "Audio Blob", "VHS Glitch" ],
							"parameter_mmax" : 2
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-preset-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 420.0, 130.0, 100.0, 22.0 ],
					"text" : "prepend preset"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-intensity-dial",
					"maxclass" : "live.dial",
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 100.0, 60.0, 50.0 ],
					"patching_rect" : [ 540.0, 100.0, 50.0, 50.0 ],
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "float" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "intensity",
							"parameter_shortname" : "Intens.",
							"parameter_type" : 0,
							"parameter_mmax" : 4.0,
							"parameter_initial_enable" : 1,
							"parameter_initial" : [ 1.0 ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-intensity-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 540.0, 160.0, 100.0, 22.0 ],
					"text" : "prepend intensity"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-color-dial",
					"maxclass" : "live.dial",
					"presentation" : 1,
					"presentation_rect" : [ 80.0, 100.0, 60.0, 50.0 ],
					"patching_rect" : [ 660.0, 100.0, 50.0, 50.0 ],
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "float" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "color",
							"parameter_shortname" : "Color",
							"parameter_type" : 0,
							"parameter_mmax" : 1.0,
							"parameter_initial_enable" : 1,
							"parameter_initial" : [ 0.5 ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-color-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 660.0, 160.0, 90.0, 22.0 ],
					"text" : "prepend color"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-reaction-dial",
					"maxclass" : "live.dial",
					"presentation" : 1,
					"presentation_rect" : [ 150.0, 100.0, 60.0, 50.0 ],
					"patching_rect" : [ 780.0, 100.0, 50.0, 50.0 ],
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "float" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "reaction",
							"parameter_shortname" : "React.",
							"parameter_type" : 0,
							"parameter_mmax" : 4.0,
							"parameter_initial_enable" : 1,
							"parameter_initial" : [ 1.0 ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-reaction-prep",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 780.0, 160.0, 100.0, 22.0 ],
					"text" : "prepend reaction"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-status",
					"maxclass" : "live.text",
					"mode" : 0,
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 160.0, 400.0, 22.0 ],
					"parameter_enable" : 0,
					"text" : "Idle. Press OPEN VISUAL.",
					"patching_rect" : [ 30.0, 290.0, 300.0, 22.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-route-status",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 30.0, 280.0, 100.0, 22.0 ],
					"text" : "route status"
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-plugout", 0 ],
					"source" : [ "obj-plugin", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-plugout", 1 ],
					"source" : [ "obj-plugin", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-mix", 0 ],
					"source" : [ "obj-plugin", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-mix", 1 ],
					"source" : [ "obj-plugin", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-norm", 0 ],
					"source" : [ "obj-mix", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-peakamp", 0 ],
					"source" : [ "obj-norm", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-peak-prep", 0 ],
					"source" : [ "obj-peakamp", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-peak-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-lp-bass", 0 ],
					"source" : [ "obj-norm", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-lp-mid", 0 ],
					"source" : [ "obj-norm", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-mid-sub", 0 ],
					"source" : [ "obj-lp-mid", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-mid-sub", 1 ],
					"source" : [ "obj-lp-bass", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-treb-sub", 0 ],
					"source" : [ "obj-norm", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-treb-sub", 1 ],
					"source" : [ "obj-lp-mid", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-bass-avg", 0 ],
					"source" : [ "obj-lp-bass", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-bass-snap", 0 ],
					"source" : [ "obj-bass-avg", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-bass-prep", 0 ],
					"source" : [ "obj-bass-snap", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-bass-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-mid-avg", 0 ],
					"source" : [ "obj-mid-sub", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-mid-snap", 0 ],
					"source" : [ "obj-mid-avg", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-mid-prep", 0 ],
					"source" : [ "obj-mid-snap", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-mid-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-treb-avg", 0 ],
					"source" : [ "obj-treb-sub", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-treb-snap", 0 ],
					"source" : [ "obj-treb-avg", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-treb-prep", 0 ],
					"source" : [ "obj-treb-snap", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-treb-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-rms-avg", 0 ],
					"source" : [ "obj-norm", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-rms-snap", 0 ],
					"source" : [ "obj-rms-avg", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-rms-prep", 0 ],
					"source" : [ "obj-rms-snap", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-rms-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-tick-msg", 0 ],
					"source" : [ "obj-metro", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-tick-msg", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-init-metro", 0 ],
					"source" : [ "obj-loadbang", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-metro", 0 ],
					"source" : [ "obj-init-metro", 0 ]
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
					"destination" : [ "obj-route-jit", 0 ],
					"source" : [ "obj-js", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-param-prep", 0 ],
					"source" : [ "obj-route-jit", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-shader-prep", 0 ],
					"source" : [ "obj-route-jit", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-vplane", 0 ],
					"source" : [ "obj-param-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-vplane", 0 ],
					"source" : [ "obj-shader-prep", 0 ]
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
					"destination" : [ "obj-open-msgs", 0 ],
					"source" : [ "obj-open-btn", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-world", 0 ],
					"source" : [ "obj-open-msgs", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-preset-prep", 0 ],
					"source" : [ "obj-preset-menu", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-preset-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-intensity-prep", 0 ],
					"source" : [ "obj-intensity-dial", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-intensity-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-color-prep", 0 ],
					"source" : [ "obj-color-dial", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-color-prep", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-reaction-prep", 0 ],
					"source" : [ "obj-reaction-dial", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-js", 0 ],
					"source" : [ "obj-reaction-prep", 0 ]
				}

			}
 ],
		"dependency_cache" : [ 			{
				"name" : "alfred_shader.js",
				"bootpath" : "~/Documents/Max 8/Library/alfred-m4l",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "liquid-chrome.jxs",
				"bootpath" : "~/Documents/Max 8/Library/alfred-m4l/shaders",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "audio-blob.jxs",
				"bootpath" : "~/Documents/Max 8/Library/alfred-m4l/shaders",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "vhs-glitch.jxs",
				"bootpath" : "~/Documents/Max 8/Library/alfred-m4l/shaders",
				"type" : "TEXT",
				"implicit" : 1
			}
 ],
		"autosave" : 0
	}

}
