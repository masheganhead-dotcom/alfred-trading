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
		"rect" : [ 0.0, 0.0, 80.0, 320.0 ],
		"bglocked" : 0,
		"openinpresentation" : 1,
		"default_fontsize" : 11.0,
		"default_fontface" : 0,
		"default_fontname" : "Arial",
		"gridonopen" : 1,
		"gridsize" : [ 8.0, 8.0 ],
		"description" : "Alfred M4L Suite — one mixer strip. Embed via [bpatcher mixer-strip.maxpat @args <idx>].",
		"boxes" : [ 			{
				"box" : 				{
					"id" : "obj-arg",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "int" ],
					"patching_rect" : [ 10.0, 10.0, 50.0, 22.0 ],
					"text" : "patcherargs 0"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-idx-i",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "int" ],
					"patching_rect" : [ 10.0, 40.0, 30.0, 22.0 ],
					"text" : "i 0"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-name",
					"maxclass" : "live.text",
					"mode" : 0,
					"presentation" : 1,
					"presentation_rect" : [ 4.0, 296.0, 72.0, 18.0 ],
					"parameter_enable" : 0,
					"text" : "—",
					"patching_rect" : [ 60.0, 280.0, 80.0, 18.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-color",
					"maxclass" : "panel",
					"presentation" : 1,
					"presentation_rect" : [ 4.0, 0.0, 72.0, 4.0 ],
					"bgcolor" : [ 0.5, 0.5, 0.5, 1.0 ],
					"patching_rect" : [ 160.0, 280.0, 30.0, 6.0 ],
					"numinlets" : 1,
					"numoutlets" : 0,
					"mode" : 0
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-pan",
					"maxclass" : "live.dial",
					"presentation" : 1,
					"presentation_rect" : [ 22.0, 200.0, 36.0, 36.0 ],
					"patching_rect" : [ 60.0, 100.0, 36.0, 36.0 ],
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "float" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "pan",
							"parameter_shortname" : "Pan",
							"parameter_type" : 0,
							"parameter_mmin" : -1.0,
							"parameter_mmax" : 1.0,
							"parameter_unitstyle" : 0
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-mute",
					"maxclass" : "live.text",
					"mode" : 1,
					"text" : "M",
					"presentation" : 1,
					"presentation_rect" : [ 4.0, 240.0, 22.0, 22.0 ],
					"bgcolor" : [ 0.3, 0.3, 0.3, 1.0 ],
					"activebgcolor" : [ 1.0, 0.6, 0.1, 1.0 ],
					"textcolor" : [ 0.9, 0.9, 0.9, 1.0 ],
					"activetextcolor" : [ 0.0, 0.0, 0.0, 1.0 ],
					"patching_rect" : [ 60.0, 150.0, 22.0, 22.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "mute",
							"parameter_shortname" : "M",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-solo",
					"maxclass" : "live.text",
					"mode" : 1,
					"text" : "S",
					"presentation" : 1,
					"presentation_rect" : [ 28.0, 240.0, 22.0, 22.0 ],
					"bgcolor" : [ 0.3, 0.3, 0.3, 1.0 ],
					"activebgcolor" : [ 0.2, 0.8, 0.2, 1.0 ],
					"textcolor" : [ 0.9, 0.9, 0.9, 1.0 ],
					"activetextcolor" : [ 0.0, 0.0, 0.0, 1.0 ],
					"patching_rect" : [ 90.0, 150.0, 22.0, 22.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "solo",
							"parameter_shortname" : "S",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-arm",
					"maxclass" : "live.text",
					"mode" : 1,
					"text" : "R",
					"presentation" : 1,
					"presentation_rect" : [ 52.0, 240.0, 22.0, 22.0 ],
					"bgcolor" : [ 0.3, 0.3, 0.3, 1.0 ],
					"activebgcolor" : [ 1.0, 0.2, 0.2, 1.0 ],
					"textcolor" : [ 0.9, 0.9, 0.9, 1.0 ],
					"activetextcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"patching_rect" : [ 120.0, 150.0, 22.0, 22.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "arm",
							"parameter_shortname" : "R",
							"parameter_type" : 2,
							"parameter_mmax" : 1,
							"parameter_enum" : [ "off", "on" ]
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-vol",
					"maxclass" : "live.slider",
					"presentation" : 1,
					"presentation_rect" : [ 14.0, 100.0, 24.0, 130.0 ],
					"orientation" : 1,
					"patching_rect" : [ 200.0, 100.0, 24.0, 130.0 ],
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "float" ],
					"parameter_enable" : 1,
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "vol",
							"parameter_shortname" : "Vol",
							"parameter_type" : 0,
							"parameter_mmax" : 1.0,
							"parameter_unitstyle" : 0
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-fx1",
					"maxclass" : "live.text",
					"mode" : 0,
					"text" : "fx 1",
					"presentation" : 1,
					"presentation_rect" : [ 4.0, 8.0, 72.0, 16.0 ],
					"parameter_enable" : 0,
					"patching_rect" : [ 230.0, 10.0, 72.0, 16.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-fx2",
					"maxclass" : "live.text",
					"mode" : 0,
					"text" : "fx 2",
					"presentation" : 1,
					"presentation_rect" : [ 4.0, 26.0, 72.0, 16.0 ],
					"parameter_enable" : 0,
					"patching_rect" : [ 230.0, 30.0, 72.0, 16.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-fx3",
					"maxclass" : "live.text",
					"mode" : 0,
					"text" : "fx 3",
					"presentation" : 1,
					"presentation_rect" : [ 4.0, 44.0, 72.0, 16.0 ],
					"parameter_enable" : 0,
					"patching_rect" : [ 230.0, 50.0, 72.0, 16.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-fx4",
					"maxclass" : "live.text",
					"mode" : 0,
					"text" : "fx 4",
					"presentation" : 1,
					"presentation_rect" : [ 4.0, 62.0, 72.0, 16.0 ],
					"parameter_enable" : 0,
					"patching_rect" : [ 230.0, 70.0, 72.0, 16.0 ],
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-outlet-vol",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 200.0, 250.0, 90.0, 22.0 ],
					"text" : "s strip_out_vol"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-outlet-pan",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 60.0, 250.0, 90.0, 22.0 ],
					"text" : "s strip_out_pan"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-outlet-mute",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 60.0, 200.0, 100.0, 22.0 ],
					"text" : "s strip_out_mute"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-outlet-solo",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 90.0, 200.0, 100.0, 22.0 ],
					"text" : "s strip_out_solo"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-outlet-arm",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 120.0, 200.0, 100.0, 22.0 ],
					"text" : "s strip_out_arm"
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-idx-i", 0 ],
					"source" : [ "obj-arg", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-outlet-vol", 0 ],
					"source" : [ "obj-vol", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-outlet-pan", 0 ],
					"source" : [ "obj-pan", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-outlet-mute", 0 ],
					"source" : [ "obj-mute", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-outlet-solo", 0 ],
					"source" : [ "obj-solo", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-outlet-arm", 0 ],
					"source" : [ "obj-arm", 0 ]
				}

			}
 ]
	}

}
