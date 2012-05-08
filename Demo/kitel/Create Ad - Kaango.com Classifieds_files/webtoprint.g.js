var KAANGO = KAANGO || {};

/* SOME GLOBALS VARIABLES */
var GLOBAL = {
	w2pDefaultDate: '',
	w2pCategory: '',
	w2pCategoryId: ''
};



/*
 * Javascript Namespace to Hold the Web To Print Steps 
 */
$.extend(true,KAANGO, {
	wtop: {

        packageSaved: false,

		/**
		 * Builds Out the List of Available Categories A User Can Choose for the Web To Print Ad
		 * 
		 * @param object categories The List of Categories to Choose From
		 * @param string index The Current Selected Item In the List. So It is the One Choosen When the Drop Down is Drawn
		 * 
		 */
		categorySelector: function (categories, index)
		{
            KAANGO.log('creating w2p category selector');
			GLOBAL.w2pCategory = categories;
			GLOBAL.w2pCategoryId = index;
			
			KAANGO.html.form_creation.select('webtoprintcategories', 'wtopcategories', 'wtopcategories', categories, null, index, false);
			$("#wtopcategories").rules('add',{choose: true});

			if (index !== null)
			{
				$("#wtopcategories").attr({'disabled': false, 'value': index});
			}
			
			$("#webtoprintcategories").append("<span class='primary-blue-button'><input id='wtopcategorylock' type='button' name='wtopcategorylock' value='Select print category'></span>");
			
			$("#wtopcategorylock").parent().hide();
			// Adds a On Click Event to the "Lock the Web To Print Category Button"
			$('#wtopcategorylock').click(function() {
                KAANGO.log('wtopcategorylock clicked');
				var index = $("#wtopcategories").selectedOptions()[0].value, selected = $("#wtopcategories").selectedOptions()[0].text;
				if (index !== 'choose')
				{
					KAANGO.wtop.category = index;
					$('#webtoprintcategories').empty().append($.create('div',{id: 'selectedCat'}, selected)).append(' : ').append($.create('a', {role: 'link', 'class': 'link', id: 'changeWebToPrintCategory'}, ['Change Category']));

					KAANGO.wtop.changeCategory(categories, index);
					$("#w2pCategorySelected input").focus();
				}
			});

			$('#webtoprintcategories').show();
		},
		
		/**
		 * Binds the "Change Category" To the categorySelector Function
		 * So When the User Clicks They Gets a List of Categories Available
		 * 
		 * @param object categories The List of Categories to Choose From
		 * @param string index The Current Selected Item In the List. So It is the One Choosen When the Drop Down is Drawn
		 */
		changeCategory: function(categories, index) 
		{
            KAANGO.log('KAANGO.wtop.changeCategory');
			if (KAANGO.wtop.started === true)
			{
				this.changeCategoryConf();
			}
			else
			{
				$('#changeWebToPrintCategory').bind("click",function() {
					$('#webtoprintcategories').empty();
					KAANGO.wtop.categorySelector(categories, index);
				});
			}
		},
		
		changeCategoryConf : function()
		{
            KAANGO.log('KAANGO.wtop.changeCategoryConf');
			KAANGO.ca.dialog.setDefaults();
			$('#changeWebToPrintCategory').bind("click",function() {
				$('#modal_dialog').html('<p>Are you sure you want to select a different category?</p>')
					.dialog({
						title:"If you change the category you will need to select a new package and ad start date",
						close: KAANGO.ca.dialog.destroy,
						buttons:{
							'Yes, edit my print category':function(){
								KAANGO.wtop.started = false;
								KAANGO.ca.dialog.destroy.call(this);
								KAANGO.ca.cancelWTOP();
							},
							'Cancel':function(){
								KAANGO.ca.dialog.destroy.call(this);
								KAANGO.wtop.changeCategory(categories, index);
							}
						}
					});
			});
		},
		
		/**
		 * Setups the Base Categories Available to the User
		 * Either Display the Category Because of a Match
		 * OR
		 * Displays the List of Categories to Choose From
		 */
		getW2pCategories: function() 
		{
 			if (typeof KAANGO.wtop.edit.category != 'undefined')
			{
                KAANGO.log('w2p edit category set');
                if(KAANGO.wtop.mode != 3) {
				    $('#webtoprintcategories').append($.create('div',{id: 'selectedCat'}, KAANGO.wtop.edit.category)).append(' : ').append($.create('a', {role: 'link', 'class': 'link', id: 'changeWebToPrintCategory'}, ['Change Category']));;
			    	KAANGO.wtop.changeCategoryConf();
                } else {
                    $('#w2pCategories').hide();
                }
				KAANGO.wtop.category = KAANGO.wtop.edit.category;
				$('#w2pCategorySelected').click();
			}
			else
			{
                KAANGO.log('loading w2p categories');
				KAANGO.util.ajax('wtopcategories',{"data":{},				
					"success": function (json) {
                        KAANGO.log('w2p categories loaded');
						$('#webtoprintcategories').empty();
						
						/*
						 * This Means that the User Category Was Matched
						 * Just Display the Category Name, 'Change Category' Link and The Continue Button
						 */
						if (typeof(json.matched.id) !== 'undefined' && typeof(json.matched.name) !== 'undefined')
						{
                            KAANGO.log('w2p category matched');
							/*
							$('#webtoprintcategories').append($.create('div',{id: 'selectedCat'},json.matched.name)).append(' : ').append($.create('a', {role: 'link', 'class': 'link', id: 'changeWebToPrintCategory'}, ['Change Category']));							
							*/
						   	GLOBAL.w2pCategory = json.list;
						   	GLOBAL.w2pCategoryId = json.matched.id;
							KAANGO.wtop.changeCategory(json.list, json.matched.id);
							KAANGO.wtop.category = json.matched.id;
							/*
							 * Draws the List of Categories Available to the User
							 */
							KAANGO.wtop.categorySelector(json.list, json.matched.id);
						}
						else
						{
                            KAANGO.log('showing w2p category selector');
							/*
							 * Draws the List of Categories Available to the User
							 */
							KAANGO.wtop.categorySelector(json.list, null);
						}
					}
				});
			}
			
			$("#SandBoxNewContent").html($("#SandBoxContent").html());
		},
		
		/**
		 * Binds the Functions Needed to Proceed the Package Step After Print Category Selection 
		 */
		w2pCategoriesComplete: function () 
		{
            KAANGO.log('KAANGO.wtop.w2pCategoriesComplete');
			KAANGO.wtop.started = true;
			
			$('#changeWebToPrintCategory').unbind();
			this.changeCategoryConf();
			
			JUI.datepicker();
			$("#wtopcategorylock").click();	
			//$('#skipPrint > :button').val('Cancel Print Ad');
			$('#skip_cancel_w2p').text('Cancel Print Ad');
			this.getPackages();
		},
		
		/**
		 * Binds the Functions Needed to Proceed to the Publications Step After Package Selection
		 */
		w2pPackagesPublicationsComplete: function() 
		{
			var container = $('[name=wtoppackpub]:checked').parents('.wtoppackpub_wrapper'),
                checkboxes = $('[name=wtoppackpub]:checked').length;
			if (container.find('input[type=checkbox]:checked').length == 0 && checkboxes) {
				KAANGO.ca.showMessage('Package Error', 'Please select a publication', 'OK');
				return "INVALID";
		    }
			container.find('input[type=checkbox]:checked').attr({'disabled': 'disabled'});
			container.find('input[type=checkbox]:not(:checked)').attr({'disabled': 'disabled'});

			// Gets the Value of the Radio Button for the Package Choosen
			if(KAANGO.wtop.packId == 0)
			{
				var package_selected = $("input[name='wtoppackpub']:checked"),
					package_parents = $(package_selected).parents('div[id^=wtoppackpub_wrapper_]'),
					siblings = package_parents.siblings('div[id^=wtoppackpub_wrapper_]'),
					d_struct = package_parents.find("div[id^=wtoppackpub_name_desc_]"),
					name = $(d_struct).find("span[id^=wtoppackpub_name_]").html(),
					desc = $(d_struct).find("span[id^=wtoppackpub_desc_]").html(),
					i = 0,
					key;
				
				KAANGO.wtop.packId = $("input[name='wtoppackpub']:checked").val();
				
				// Need to Build A List of the Optional Pubs and Zones Somebody Selected
				$(package_parents).children().find(':checkbox:checked').each( function (index) {

                    if (typeof KAANGO.wtop.save == 'undefined')
                    {
                        KAANGO.wtop.save = new Array();
                    }

					if ($(this).attr('id').indexOf('_zones_') !== -1)
					{
						KAANGO.wtop.save[i] = {'type': 'zone' , 'val': $(this).val()};
						i++;
					}
					else
					{
						for (key in KAANGO.wtop.always[KAANGO.wtop.packId])
						{
							if (KAANGO.wtop.always[KAANGO.wtop.packId][key].indexOf('publication_') !== -1 &&
								KAANGO.wtop.always[KAANGO.wtop.packId][key].indexOf($(this).val()) === -1)
							{
								KAANGO.wtop.save[i] = {'type': 'pub' , 'val': $(this).val()};
								i++;
								
								continue;
							}
						}
					}
				});
				if(siblings.size()) {
					siblings.add('#wtopPackagesHeader').remove();
					$('#webtoprintpackagespublications')
					.prepend($('<div id="packagepub_dets"/>').append(
						$('<div style="padding: 5px"/>').append(
						$('<a class="link" id="w2pPackageEdit">Change Package</a>')
					).append(package_parents)
					));
					package_selected.attr('checked', 'checked');
				}
			}

			this.w2pEditPackageBind();
			
			this.getRunDates();
			this.buildPrintingDatesDescription();
			
		},
		
		w2pEditPackageBind: function()
		{
			$("#w2pPackageEdit").bind("click",function(){
				
				if (typeof KAANGO.wtop.edit.packageName != 'undefined')
				{
					delete KAANGO.wtop.edit.packageName
				}
				
				if (typeof KAANGO.wtop.edit.startDate != 'undefined')
				{
					delete KAANGO.wtop.edit.startDate;
				}
				
				if (typeof KAANGO.wtop.edit.endDate != 'undefined')
				{
					delete KAANGO.wtop.edit.endDate;
				}
				
				KAANGO.wtop.getPackages();
				
				$(this).parents("#packagepub_dets").remove();
				var w2pdates = $("#w2pRundates").find("#wtoprundates");			
				w2pdates.find("#wtopdateselectedprefix").remove();
				w2pdates.find("#wtopenddateselectedprefix").remove();
				w2pdates.find("#wtoprundaysselectedprefix").remove();
				KAANGO.wtop.packId = 0;
				$("#w2pPackageSelected").show();
				$("#w2pDateEditODM").remove();
				$("#w2pDateEdit").remove();
				$("#w2pRundates").removeClass("w2pStep").addClass("w2pStep_inactive");
								
				KAANGO.wtop.modify.text = tinyMCE.activeEditor.getContent();
				
				if (typeof SWFUpload_wtop != 'undefined')
				{
					SWFUpload_wtop.destroy();
				}
				
				var w2ptext = $("#w2pCreateAd");
				w2ptext.find("#wtopadcreation").empty();
				w2ptext.find("#wtopadpreview").find("#wtopadlinesminmax").empty();
				w2ptext.find("#wtopadpreview").find("#wtopad_wrapper").remove();
				
				w2ptext.hide();
			});
		},
		
		/**
		 * Binds the Functions Needed to Proceed to the Ad Creation and Preview Step After Run Dates Selection
		 */
		w2pRundatesComplete: function() 
		{
            KAANGO.log('w2pRundatesComplete');
			$("#wtoprundatescal").datepicker('destroy');
			$("#w2pDateEditODM").remove();

            if(KAANGO.wtop.mode != 3) {
                if($('#w2pDateEdit').length<=0) {
                    $("#wtoprundates").append($.create("div",{"id":"w2pDateEdit"}));
                    $("#w2pDateEdit").append('<a id="w2pDateEditLink" class="link">Edit Date</a>');
                }
            } else {
                $('#w2pRundates').hide();
            }
			
			$("#w2pDateEditLink").bind("click",function(){
 				if (typeof KAANGO.wtop.edit.startDate != 'undefined')
				{
					delete KAANGO.wtop.edit.startDate;
				}
				
				if (typeof KAANGO.wtop.edit.endDate != 'undefined')
				{
					delete KAANGO.wtop.edit.endDate;
				} 

				var w2pdates = $("#w2pRundates").find("#wtoprundates");
				w2pdates.find("#wtopdateselectedprefix").remove();
				w2pdates.find("#wtopenddateselectedprefix").remove();
				w2pdates.find("#wtoprundaysselectedprefix").remove();
				w2pdates.find("#wtoprundatescal").find(".ui-state-active").removeClass("ui-state-active");
				w2pdates.find("#wtoprundatescal").find(".w2p-pubDay").removeClass("w2p-pubDay");

				$("#w2pRundatesSelected").show();


				$("#w2pCreateAd").removeClass("w2pStep").addClass("w2pStep_inactive");
				
				GLOBAL.w2pDefaultDate = '';
				$("#w2pRundates #w2pDateEdit").remove();
				KAANGO.wtop.getRunDates();
				
				KAANGO.wtop.modify.text = tinyMCE.activeEditor.getContent();
				
				if ($("#wtopborders").length > 0 && $('#wtopborders').selectedValues()[0] != -1)
				{
					KAANGO.wtop.modify.border = $('#wtopborders').selectedValues()[0];	
				}
				
				if ($("#wtopicons").length > 0 && $('#wtopicons').selectedValues()[0] != -1)
				{
					KAANGO.wtop.modify.icon = $('#wtopicons').selectedValues()[0];	
				}
				
				if ($("#wtopbackgrounds").length > 0 && $('#wtopbackgrounds').selectedValues()[0] != -1)
				{
					KAANGO.wtop.modify.background = $('#wtopbackgrounds').selectedValues()[0];	
				}
				
				if ($("#wtopphotos_delete").length > 0)
				{
					KAANGO.wtop.modify.photo = true;	
				}
				
				if (typeof SWFUpload_wtop != 'undefined')
				{
					SWFUpload_wtop.destroy();
				}
				
				var w2ptext = $("#w2pCreateAd");
				w2ptext.find("#wtopadcreation").empty();
				w2ptext.find("#wtopadpreview").find("#wtopadlinesminmax").empty();
				w2ptext.find("#wtopadpreview").find("#wtopad_wrapper").remove();
				
				w2ptext.hide();
			});
			
			this.getCreateAd();
		},

        editPackagesBypass : function ()
        {
            $('#w2pPackageSelected').click();
        },

		/**
		 * Builds the List of Packages Available to the User Based on the Web To Print Category Selected
		 * 
		 * Either Displays a List With Radio Buttons
		 * OR
		 * Displays the One Available to the User and Moves to the Next Step
		 */
		getPackages: function ()
		{
			var autoClick;
			if (typeof KAANGO.wtop.edit.packageName != 'undefined')
			{
                KAANGO.log('w2p package already defined');
				var prefix = 'webtoprintpackage', d = $.create('div', {id: prefix}).appendTo('#webtoprintpackagespublications');
                if(KAANGO.wtop.mode != 3) {
				    $(d).append($.create('div', {id: 'packagepub_dets'}, KAANGO.wtop.edit.packageName).append(' <a id="w2pPackageEdit" class="link">Change package</a>'));
                } else {
                    $('#w2pPackagesPublications').hide();
                }
				
				this.w2pEditPackageBind();
				
				$('#webtoprintpackagespublications').show();

				KAANGO.wtop.packId = KAANGO.wtop.edit.packageID;
				KAANGO.wtop.pubId = KAANGO.wtop.edit.publicationID;

                /*
                 * need to delay for a second to make sure everything has been drawn in
                 * because this function call was removed and the timing got thrown off
				 * KAANGO.wtop.saveW2POption('w2p_packageID', KAANGO.wtop.packId, false, true);
				 */
                setTimeout("KAANGO.wtop.editPackagesBypass()", 1000);
			}
			else
			{
                KAANGO.log('getting w2p packages');
				KAANGO.util.ajax('wtoppackages',{"data":{categoryname: KAANGO.wtop.category},
					"success": function (json) {
	
						var packageSelection = function(pack) {
							var parent_tree = $(pack).parents('div[id^=wtoppackpub_wrapper_]');
							$(this).parents('div[id=webtoprintpackagespublications]').children()
								   .filter('div[id!=' + $(parent_tree).attr('id') + ']')
								   .find(':checkbox:not(:disabled)')
								   .each( function () { 
									   $(this).attr('disabled', 'disabled');
								   });
							
							KAANGO.wtop.pubId = $(parent_tree).find(":checkbox:first").val();
							
							$(parent_tree).find(':checkbox').each( function () {
								if (KAANGO.wtop.checkIfValueExists($(this).val(), KAANGO.wtop.always[$(pack).val()]) === false)
								{
									$(this).removeAttr('disabled');
								}
							});
						};
					
						if (json.length == 0)
						{
							// Nothing Returned - Bad --- No Packages Available!
						}
						else
						{
							$('#w2pPackageSelected').removeClass('wtopHidden');
							
							// Multiple Categories - Create List With Radio Buttons for the User to Choose  
							var firstItem = 'wtoppackpub_firstItem';
							for (key in json)
							{
								var pack = json[key], k = key, prefix = 'wtoppackpub',
									wrapper = $.create('div', {'class': 'wtoppackpub_wrapper '+firstItem, id: [prefix, 'wrapper', k].join('_')}).appendTo('#webtoprintpackagespublications'),
									radio = $.create('div', {'class': 'wtoppackpub radioColumn ', id: [prefix, 'radio', k].join('_'), 'package':k}).appendTo(wrapper),
									name_desc = $.create('div', {'class': 'wtoppackpub packageColumn', id: [prefix, 'name_desc', k].join('_')}).appendTo(wrapper),
									pubs = $.create('div', {'class': 'wtoppackpub publicationColumn', id: [prefix, 'pubs', k].join('_')}).appendTo(wrapper),
									ul_id = [prefix, 'pubs', 'ul', k].join('_'),
									ol_ai_id = [prefix, 'pubs', 'ol', 'ai', k].join('_'),
									amount_ai_id = [prefix, 'pubs', 'amount', 'ai', k].join('_'),
									amount_ai_link_id = [prefix, 'pubs', 'amount', 'link', 'ai', k].join('_'),
									radioInput = KAANGO.html.form_creation.radio_only(prefix, [prefix, k, 'radio'].join('_'), pack.id);
								
								firstItem = '';
								$(radio).append(radioInput);
	
								$(name_desc).append($.create('span', {'class': 'wtop-package-name packageName', id: [prefix, 'name', k].join('_')}, pack.name));
								
								$(name_desc).append($.create('span', {'class': 'wtop-package-description packageDescription', id: [prefix, 'desc', k].join('_')}, pack.desc));
								
								$(pubs).append($.create('ul', {id: ul_id, 'class' : 'kng-no-list-style kng-no-margin kng-no-padding'}))
									   .append($.create('span', {id: amount_ai_id, 'class' : 'kng-clear-both kng-block'}))
									   .append($.create('ol', {'id': ol_ai_id, 'package': k}));
								
								KAANGO.wtop.always[pack.id] = [];
								
								for (var p_key in pack.pubs.list)
								{
									var pub_key = p_key, pub = pack.pubs.list[pub_key],
										li_id = [pack.id, 'pubs', 'li', pub.id].join('_'),
										check_id = [pack.id, 'publication', pub.id].join('_'),
										check = KAANGO.html.form_creation.checkbox_only(check_id, check_id, pub.id, null),
										pub_type = ' (', plural = '';
									
									$('#' + ul_id).append($.create('li', {'id': li_id}));
									
									if (pub.req === true)
									{
										pub_type += 'Default';
									}
									else
									{
										pub_type += 'Optional';
									}
									
									pub_type += ' Publication)';
									
									$("#" + li_id).append(check).append($.create('span', {'class': 'wtop-publication-name'}, pub.name + pub_type));
									
									if (pub.req === true)
									{
										$('#' + check_id).attr('checked', 'checked');
										KAANGO.wtop.always[pack.id].push('publication_' + pub.id);
									}
	
									$('#' + check_id).attr('disabled', 'disabled');
									
									if (typeof(pub.i) !== 'undefined' && pub.i.length > 0)
									{
										if (pub.i.length <= 3)
										{
											if (pub.i.length >= 2)
											{
												plural = 's';
											}
											
											$('#' + amount_ai_id).html(pub.i.length + ' More Publication' + plural + ' Included!');
											$('#' + ol_ai_id).show();
										}
										else
										{
	
											$('#' + ol_ai_id).hide();
											$('#' + amount_ai_id).append(
												$.create('a', {'id': amount_ai_link_id, 'role': 'link', 'class':'link', 'more':ol_ai_id, 'package':k}, pub.i.length + ' More Publications Included! '))
												.toggle(function(){
													KAANGO.ca.analytics('paceAdViewPubList', 'show');
													$('#'+$(this).find('a').attr('more')).show();
													$(this).find('span').html('Hide All');
													// HACK - this is sick... but it fixes redraw issues in IE
													$(this).parent().hide().show();	
												},
												function(){
													KAANGO.ca.analytics('paceAdViewPubList', 'hide');
													$('#'+$(this).find('a').attr('more')).hide();
													$(this).find('span').html('View All');
													// HACK - this is sick... but it fixes redraw issues in IE
													$(this).parent().hide().show();
												});
												$('#'+amount_ai_link_id).append($.create('span',{'class':'wtopShowHideMsg'},'View All'));
										}
										
										for (var j=0; j<pub.i.length; j++)
										{
											$li = $('<li/>').attr('id', ol_ai_id+'_'+j);
											$('<span/>').text(pub.i[j]).appendTo($li);
											$('#' + ol_ai_id).append($li);
										}
										$('#' + ol_ai_id).after('<div style="clear:both"> </div>');
									}
									
									if (pack.pubs.zones === true)
									{
										if (pub.z.length === 0)
										{
											$('#' + li_id).append($.create('div', {id: [prefix, k, 'zones'].join('_')}, ''));
										}
										else
										{
											var zone_checkbox = '', total = [], 
												options = {}, checked = [], 
												zones_div = [prefix, k, 'zones'].join('_'), 
												zones_n_i = [prefix, k, 'zones_selection'].join('_');
				
											KAANGO.wtop.zones[pub.id] = [];
											
											for (k_z in pub.z)
											{
												options[pub.z[k_z].id] = pub.z[k_z].name;
												
												total.push(pub.z[k_z].id);
												
												if (pub.z[k_z].req === true)
												{
													checked.push(pub.z[k_z].id);
	
													KAANGO.wtop.always[pack.id].push('zones_selection_' + pub.z[k_z].id);
												}
											}
											
											$('#' + li_id).append($.create('div', {id: zones_div}, ''));

											KAANGO.html.form_creation.checkbox(zones_div, zones_n_i, zones_n_i, null, options);
											for (c in checked)
											{
												zone_checkbox = $('#' + zones_n_i + '_' + checked[c]);
												
												zone_checkbox.attr('checked', 'checked');
												
												// Send This Zone Back Over to the Server
												KAANGO.wtop.zones[pub.id].push(zone_checkbox.val());
											}
											
											for (t in total)
											{
												$('#' + zones_n_i + '_' + total[t]).attr('disabled', 'disabled');
											}

				                            $('#' + zones_div + ' > ul').addClass('kng-no-list-style kng-no-padding kng-no-margin');
											
											delete total;
											delete checked;
											delete options;
										}
									} 
								}
								
								if (json.length == 1)
								{
									var input = $('input[type=radio][name=wtoppackpub]:first');
								
									$('input[type=radio][name=wtoppackpub]:first').attr('checked', 'checked');
									
									packageSelection(input);
									
									autoClick = true;
									
									KAANGO.wtop.saveW2POption('w2p_packageID', input.val(), false, true);
								}
							}
							
							$('#w2pPackagesPublications').addClass('errorable');
							$('input[type=radio][name=wtoppackpub]').rules('add',{required: true,
								messages: {
									required: "Please select a print package"
								}
							});
							
							
							$('#webtoprintpackagespublications * input[type="radio"]').bind('click', function () {
								$('.wtoppackpub_wrapper').find(':checkbox').attr('disabled','disabled');
								KAANGO.wtop.saveW2POption('w2p_packageID', $(this).val(), false, true);
								packageSelection($(this));
								$(this).parent().parent().parent().find('ol:visible').prev().find('> a').click();
								$(this).parent().parent().find('ol:hidden').prev().find('> a').click();
							});
							
							if (json.length > 0 && $('#wtoppackpub_wrapper_0').length > 0)
							{
								$('#webtoprintpackagespublications').prepend(
									$.create('div', {'class': 'wtoppackpub wtopPackagesHeader', 'id':'wtopPackagesHeader'})
								);
								$('#wtopPackagesHeader').append($.create('span', {'class': 'wtoppackpub radioColumn radioHeader'}, 'Select'),
									   $.create('span', {'class': 'wtoppackpub packageColumn packageHeader'}, 'Package name & description'),
									   $.create('span', {'class': 'wtoppackpub publicationColumn publicationHeader'}, 'Publications')
								);
							}
						}
					}
				});
			}
		},
		
		checkIfValueExists: function (val, array)
		{
			var retval = false;
			
			for (var key in array)
			{
				if (array[key].indexOf(val) !== -1)
				{
					retval = true;
				}
			}
			
			return retval;
		},
		
		/**
		 * Walks Each Date Available on the Calender and 
		 * Determine if the User Can Choose It For there Print Ad
		 * 
		 * @param object date The Date That The Calender Thinks Is Available Based on dateMin and dateMax
		 * 
		 * @return array 0 = True - If the Date is Available
		 * 				 1 = False - If the Date is Not Available
		 */
		buildAvailableRunDays: function (date)
		{
			var avail = false, pub = false;

			for (var i = 0, days_avail = KAANGO.wtop.forip.runDays.length; i < days_avail; i++)
			{
				if (date.getMonth() == KAANGO.wtop.forip.runDays[i][1] && 
					date.getDate() == KAANGO.wtop.forip.runDays[i][2] && 
					date.getFullYear() == KAANGO.wtop.forip.runDays[i][0])
				{
					avail = true;
				}
			}
			
			for (var i = 0, length = KAANGO.wtop.pubDates.length; i < length; i++)
			{
				var tmp = KAANGO.wtop.pubDates[i].split('-');
				
				if (date.getMonth() == parseInt(tmp[1],10) - 1 && 
					date.getDate() == tmp[2] && 
					date.getFullYear() == tmp[0])
				{
					pub = true;
				}
			}
			
			if (pub === true)
			{
				if(GLOBAL.w2pDefaultDate != null)
					return [true, 'w2p-pubDay'];
				else
					return [true,''];
			}
			else if (avail === true)
			{
				return [true, ''];
			}

			return [false, ''];
		},
			
		buildPrintingDatesDescription: function(){
			if($('#wtopdateselectedprefix').length==0){
				$.create('div', {'id': 'wtopdateselectedprefix'}).appendTo('#wtoprundates');
				$.create('label', {'class': 'startDate'}, 'Start Date: ').appendTo('#wtopdateselectedprefix');
				$.create('span', {'id': 'wtopdateselected'}).appendTo('#wtopdateselectedprefix');

				$.create('div', {'id': 'wtopenddateselectedprefix'}).appendTo('#wtoprundates');
				$.create('label', {'class': 'endDate'}, 'End Date: ').appendTo('#wtopenddateselectedprefix');
				$.create('span', {'id': 'wtopenddateselected'}).appendTo('#wtopenddateselectedprefix');
				
				$.create('div', {'id': 'wtoprundaysselectedprefix'}).appendTo('#wtoprundates');
				$.create('label', {'class': 'printingDays'}, 'Printing dates: ').appendTo('#wtoprundaysselectedprefix');
				$.create('span', {'id': 'wtoprundaysselected'}).appendTo('#wtoprundaysselectedprefix');
			}
		},
			
		updatePrintingDatesDescription: function(dates){
			var printingDatesList = '', date, date_split;
			
			for (var key in dates['pubDates']) {
                var dateParts = $.trim(dates['pubDates'][key]).split('-'),
                    date = new Date(dateParts[0], parseInt(dateParts[1],10) - 1, dateParts[2]);

                try
                {
                    printingDatesList = printingDatesList + dateFormat(date, $('#jsDayMonthFormat').text()) + ', ';
                }
                catch(e)
                {
                    // for safety so the script does not stop running
                    // alert(e);
                }
			}

			// Removes the Last Comma and Space
			printingDatesList = printingDatesList.slice(0, (printingDatesList.length - 2));
			$('#wtopdateselected').html(dateFormat(dates['startDate'],  $('#jsDayMonthFormatWithDay').text()));
			$('#wtopenddateselected').html(dateFormat(dates['endDate'],  $('#jsDayMonthFormatWithDay').text()));
			$('#wtoprundaysselected').html(printingDatesList);
		},
		
		wtopRunDates: '',
		
		/**
		 * Builds A Calendar For the User Choose Available Run Date
		 */
		getRunDates: function()
		{

            if(KAANGO.wtop.packageSaved && !KAANGO.wtop.packageSavedWaiting) {

                KAANGO.wtop.packageSavedWaiting = true;

                $.when( KAANGO.wtop.packageSaved ).then(
                    function(status){
                        KAANGO.wtop.packageSaved = null;
                        KAANGO.wtop.packageSavedWaiting = false;
                        KAANGO.wtop.getRunDates();
                    },
                    function(status){
                        alert( 'unexpected error: package selection failure' );
                    }
                );
                return;
            } else if(KAANGO.wtop.packageSaved) {
                return;
            }

			var printingDates = {};
			
			if (typeof KAANGO.wtop.edit.startDate != 'undefined' && typeof KAANGO.wtop.edit.endDate != 'undefined')
			{
                KAANGO.log('w2p run dates defined');
				var startDateSplit = KAANGO.wtop.edit.startDate.split('-'), 
					endDateSplit = KAANGO.wtop.edit.endDate.split('-'),
					startDate = new Date(startDateSplit[0], parseInt(startDateSplit[1],10) - 1, startDateSplit[2]), 
					endDate = new Date(endDateSplit[0], parseInt(endDateSplit[1],10) - 1, endDateSplit[2]);
				
				KAANGO.wtop.wtpgetrundates(startDateSplit[1]+'/'+startDateSplit[2]+'/'+startDateSplit[0], 2);
				
				KAANGO.wtop.forip.selectedDay = KAANGO.wtop.edit.startDate;
				
				printingDates = {'startDate':startDate, 'endDate':endDate, 'pubDates':KAANGO.wtop.edit.rundates };
				
				KAANGO.wtop.buildPrintingDatesDescription();
				KAANGO.wtop.updatePrintingDatesDescription(printingDates);
					
				delete startDateSplit;
				delete endDateSplit;
				delete startDate;
				delete endDate;
				
				$('#w2pCreateAd').show('slow', function () {
					KAANGO.wtop.w2pRundatesComplete();
					$('#w2pRundatesSelected').hide();
				});
			}
			else
			{
                KAANGO.log('getting w2p run dates');

				KAANGO.util.ajax('wtoprundates',{"data":{categoryId: KAANGO.wtop.category, packageId: KAANGO.wtop.packId, publicationId: KAANGO.wtop.pubId},
					"success": function (json) {
	
						/*
						 * We Had To Wait Till the Package and Base Publication Was Saved
						 * Send Over Any Other Pubs and Zones Checked For Save
						 */
						for (var key in KAANGO.wtop.save)
						{
							var url = null, data = {};
							
							if (KAANGO.wtop.save[key].type == 'pub')
							{
								url = 'wtopsaveoptionalpub';
								data = {'publicationId': KAANGO.wtop.save[key].val}
							}
							else if (KAANGO.wtop.save[key].type == 'zone')
							{
								url = 'wtopsavezone';
								data = {'zone': KAANGO.wtop.save[key].val}
							}
							
							if (url !== null)
							{
								KAANGO.util.ajax(url, {'data': data});
							}
						}

						delete KAANGO.wtop.save;
						
						/*
						 * --- FYI: Javascript Date Object Month is Zero Based 0 = Jan, 1 = Feb, .... 10 = Nov, 11 = Dec ---
						 * --- FYI: passing base10 into parseInt('0X',10) is necessary, otherwise parseInt('08') assumes octal and evals to 0 
						 */
						var key = 0,
							runDays = '',
							min = json.min.split('-'), 
							max = json.max.split('-'), 
							endPubDate = json.pubDate[json.pubDate.length - 1].split('-'),
							// new Date(year, month, date [, hour, minute, second, millisecond ])
							// Sets Through the JS Date Object the Minimum Date Allowed to be Choosen on the Calendar
							dateMin = new Date(min[0], parseInt(min[1],10) - 1, min[2]), 
							// Sets Through the JS Date Object the Maximum Date Allowed to be Choosen on the Calendar
							dateMax = new Date(max[0], parseInt(max[1],10) - 1, max[2]), 
							dateEndPub = new Date(endPubDate[0], parseInt(endPubDate[1],10) - 1, endPubDate[2]), 
							months = 2;

						KAANGO.wtop.wtopRunDates = json;
						KAANGO.wtop.forip.selectedDay = json.min;
						KAANGO.wtop.pubDates = json.pubDate;

						/*
						 * Walks Each Date Available From the Json Object and Appends it to a Array
						 * To Be Used Later To Determine if the Date Is Available 
						 */
						for (key in json.avail)
						{
							runDays = json.avail[key].split('-');
							
							// Convert the Month to Zero Based
							runDays[1] = runDays[1] - 1;
							
							KAANGO.wtop.forip.runDays.push(runDays);

						}

						/*
						 * If the Months Equal for Min and Max Then Just Display One Month
						 * The Default is to Show 2 Months
						 */
						if (dateMin.getMonth() == dateMax.getMonth())
						{
							months = 1;
						}

						printingDates = {'startDate':dateMin, 'endDate':dateEndPub, 'pubDates':json.pubDate };
						
						KAANGO.wtop.createCalendar(months, dateMax, dateMin, dateMin);
						
						$('#w2pRundatesSelected').removeClass('wtopHidden');
						
						KAANGO.wtop.buildPrintingDatesDescription();
						KAANGO.wtop.updatePrintingDatesDescription(printingDates);
					}
				});				
			}
			
			$('#w2pRundatesSelected').show();
		},
		
		createCalendar: function (months, dateMax, dateMin, defaultDate)
		{
			GLOBAL.w2pDefaultDate = defaultDate;
			/*
			 * Appends the jQuery Datepicker (http://docs.jquery.com/UI/API/1.7/Datepicker) to the Div
			 */
			$("#wtoprundatescal").show("slow");
			$("#wtoprundatescal").datepicker({
				numberOfMonths: months,
				maxDate: dateMax,
				minDate: dateMin,
				defaultDate: defaultDate,
				gotoCurrent: true,

				// Hides the Previous/Next Buttons for the Calendar, So the User Does Not Get Confused
				hideIfNoPrevNext: false,

				// Runs the Function To Find the Dates Available For Display
				beforeShowDay: KAANGO.wtop.buildAvailableRunDays,

				/*
				 * Binds a Date Click On The Calender 
				 * So We Can Set the Date Choosen By The User to A Variable for Saving To the Database
				 */
				onSelect: function(date) {
					var selected = $(this).val();
					$('#wtopdateselected').html(dateFormat(selected, dateFormat.masks.fullDate));
					KAANGO.wtop.forip.selectedDay = dateFormat(selected, dateFormat.masks.isoDate); 
		
					KAANGO.wtop.wtpgetrundates(selected, months, dateMax, dateMin, defaultDate);
			  	}
			});
		},
			
		wtpgetrundates: function(selected, months, dateMax, dateMin, defaultDate){
			KAANGO.util.ajax('wtpgetrundates',{"data":{publicationId: KAANGO.wtop.pubId, date: dateFormat(selected, dateFormat.masks.isoDate)},
				"success": function (json) {

					var endPubDate = json[json.length - 1].split('-'),
						dateEndPub = new Date(endPubDate[0], endPubDate[1] - 1, endPubDate[2])
						selected_split =  selected.split('/'),
						selectedDate = new Date(selected_split[2], parseInt(selected_split[0],10) - 1, selected_split[1]);

						if(dateEndPub > dateMax)
							var dateTrueMax = dateEndPub;
						else
							var dateTrueMax = dateMax;
						
					$('#wtopenddateselected').html(dateFormat(dateEndPub, dateFormat.masks.fullDate));
					
					KAANGO.wtop.pubDates = json;
					$("#wtoprundatescal").datepicker('destroy');
					KAANGO.wtop.createCalendar(months,dateTrueMax,dateMin,selectedDate);
					
					var printingDates = {'startDate':selected, 'endDate':dateEndPub, 'pubDates':KAANGO.wtop.pubDates };
					KAANGO.wtop.updatePrintingDatesDescription(printingDates);

					delete endPubDate;
					delete selected_split;
					delete selected;
				}
			}); 
		},
		/**
		 * Saves the Data Entered or Selected For Web To Print Ad Created
		 * 
		 * @param string field The Field The Data Was Used
		 * @param string value The Value Entered or Selected
		 * @param bool auto Tells the Ajax Action to Update the Preview Box for the Ad With the Data Returned
		 */
		saveW2POption: function (field, value, auto, costs)
		{



			var promise = KAANGO.util.ajax('wtopsaveadoptions',{"data":{'name': field, 'value': value, 'auto': (auto === true) ? 1 : 0, 'costs': (costs === true) ? 1 : 0},
				"success": function (json) {
					if (auto === true)
					{
						// Grab the Latest Print Ad Preview Box
						KAANGO.wtop.updateAdPreview(json.content);
					}
					
					if (costs === true && json.costs.length != 0)
					{
						CostingBox.buildFromOrder(json.costs);
						CostingBox.highlight();
					}
				}
			});

            if(field === 'w2p_packageID') {
                KAANGO.wtop.packageSaved = promise;
            }
		},
		
		/**
		 * Builds the Web Creation Div
		 * =- Always Created
		 * - Textarea/TinyMCE For Text
		 * =- Customer Configurable
		 * - Borders
		 * - Backgrounds
		 * - Icons
		 * - Photos 
		 */
		getCreateAd: function () 
		{
            KAANGO.log('getCreateAd');
            
			KAANGO.util.ajax('wtopcreatead',{"data":{packageId: KAANGO.wtop.packId, date: KAANGO.wtop.forip.selectedDay},
				"success": function (json) {
					$('#w2pCreateAd').show();

                    if(KAANGO.wtop.mode == 3) {
                        var $w2pDesc = $('<p/>');
                        //$w2pDesc.append('Print Category: ' + KAANGO.wtop.edit.categoryName + '<br />');
                        $w2pDesc.append('Print Package: ' + KAANGO.wtop.edit.packageName + '<br />');

                        var rundates = $('#wtoprundates').clone();
                        $('#wtoprundates').remove();
                        $w2pDesc.append(rundates);
                        
                        $('#w2pCreateAd').prepend($w2pDesc);
                        $('#w2pCreateAd').prepend('<h3>Existing Print Ad</h3>');
                        
                        $('#wtoprundatescal').empty();
                    }

					var prepop = null;
	
					if (json.k != '' && json.k !== null)
					{
						$.create('div', {id: ''}, ['The following required text is included in your ad: ', json.k].join(' ')).appendTo('#wtopadcreation');
					}

					KAANGO.wtop.min = '';
					if (json.l.r != 0)
					{
						KAANGO.wtop.min = json.l.r;
						$('#wtopadlinesminmax').append($.create('p', {}, json.l.r + ' Minimum Lines Required'));
					}

					KAANGO.wtop.max = '';
					if (json.l.e == false)
					{
						KAANGO.wtop.max = json.l.i;
						$('#wtopadlinesminmax').append($.create('p', {}, json.l.i + ' Maximum Lines Allowed'));
					}
					
					if (typeof KAANGO.wtop.modify.text != 'undefined' && KAANGO.wtop.modify.text != null)
					{
						prepop = KAANGO.wtop.modify.text;
						KAANGO.wtop.saveW2POption('w2p_text', KAANGO.wtop.modify.text, true, true);
						KAANGO.wtop.modify.text = null;
					}
					else if (typeof KAANGO.wtop.edit.printText != 'undefined')
					{
						prepop = $.trim(KAANGO.wtop.edit.printText);
						KAANGO.wtop.saveW2POption('w2p_text', prepop, true, true);
					}
					else if (json.pp != '')
					{
						prepop = $.trim(json.pp);
						KAANGO.wtop.saveW2POption('w2p_text', '<p>' + prepop + '</p>', true, true);
					}

					KAANGO.html.form_creation.textarea('wtopadcreation', 'wtptext', 'wtptext', 250, 140, 'wysiwyg', prepop, true);
					
					$('#wtptext').addClass('w2p_text_block')
						.addClass('tinyMCE')
						.rules('add',{w2pvalidation:true});
										
					KAANGO.wtop.w2pTinyMCEinit();
			
					if (json.b.e === true && json.b.o.length !== 0)
					{
						var selected = null;

						$.create('div', {id: 'wtopborders_wrapper', 'class': 'w2p_features'}).appendTo('#wtopadcreation');
						$('#wtopborders_wrapper').append('<label>Borders:</label>');

						if (typeof KAANGO.wtop.modify.border != 'undefined' && KAANGO.wtop.modify.border != null)
						{
							selected = KAANGO.wtop.modify.border;
							KAANGO.wtop.modify.border = null;
						}
						else if (typeof KAANGO.wtop.edit.borderID != 'undefined')
						{
							selected = KAANGO.wtop.edit.borderID;
						}

						KAANGO.html.form_creation.select('wtopborders_wrapper', 'w2p_borderID', 'wtopborders', json.b.o, 1, selected, null);
	
						$.create('span', {id: 'wtopborders_cost'}, KAANGO.util.monetize(json.b.p)).appendTo('#wtopborders_wrapper');
					}
				
					if (json.i.e === true && json.i.o.length !== 0)
					{
						var selected = null;

						$.create('div', {id: 'wtopicons_wrapper', 'class': 'w2p_features'}).appendTo('#wtopadcreation');
						$('#wtopicons_wrapper').append('<label>Icons:</label>');

						if (typeof KAANGO.wtop.modify.icon != 'undefined' && KAANGO.wtop.modify.icon != null)
						{
							selected = KAANGO.wtop.modify.icon;
							KAANGO.wtop.modify.icon = null;
						}
						else if (typeof KAANGO.wtop.edit.iconID != 'undefined')
						{
							selected = KAANGO.wtop.edit.iconID;
						}

						KAANGO.html.form_creation.select('wtopicons_wrapper', 'w2p_iconID', 'wtopicons', json.i.o, 1, selected, null);
						
						$.create('span', {id: 'wtopicons_cost'}, KAANGO.util.monetize(json.i.p)).appendTo('#wtopicons_wrapper');
					}
	
					if (json.bg.e === true && json.bg.o.length !== 0)
					{
						var selected = null;

						$.create('div', {id: 'wtopbackgrounds_wrapper', 'class': 'w2p_features'}).appendTo('#wtopadcreation');
						$('#wtopbackgrounds_wrapper').append('<label>Background:</label>');

						if (typeof KAANGO.wtop.modify.background != 'undefined' && KAANGO.wtop.modify.background != null)
						{
							selected = KAANGO.wtop.modify.background;
							KAANGO.wtop.modify.background = null;
						}
						else if (typeof KAANGO.wtop.edit.backgroundID != 'undefined')
						{
							selected = KAANGO.wtop.edit.backgroundID;
						}
						
						KAANGO.html.form_creation.select('wtopbackgrounds_wrapper', 'w2p_backgroundID', 'wtopbackgrounds', json.bg.o, 1, selected, null);
							
						$.create('span', {id: 'wtopbackgrounds_cost'}, KAANGO.util.monetize(json.bg.p)).appendTo('#wtopbackgrounds_wrapper');
					}
	
					if (json.ph.e === true)
					{
						JUI.progressbar();

						if (typeof KAANGO.wtop.modify.photo != 'undefined' && KAANGO.wtop.modify.photo === true)
						{
							KAANGO.wtop.photoDelete(KAANGO.wtop.photoCreateWrapper());
							KAANGO.wtop.modify.photo = false;
						}
						else if (KAANGO.wtop.edit.length == 0)
						{
							KAANGO.wtop.photoUpload();	
						}
						else
						{
							// Need To Check if the Photo Has Been Placed on This Ad
							KAANGO.util.ajax('wtopphotoplaced',{
								"success": function (placed) {
									if (placed)
									{
										KAANGO.wtop.photoDelete(KAANGO.wtop.photoCreateWrapper());
									}
									else
									{
										KAANGO.wtop.photoUpload();
									}
								}
							});
						}
					}
	
					// Bind The Changes To the HTML Select Boxs to Action to Send the Users Selection Back to the Server
					$("#wtopadcreation * :input['select-one']").change(function() {
						$('#wtopaddialog').hide();
						KAANGO.wtop.saveW2POption($(this).attr('name'), $(this).val(), true, true);
					});

                    $('#w2pComplete').show();
				}
			});
		},
		
		photoCreateWrapper : function()
		{
			return $.create('div', {id: 'wtopphotos_wrapper'}).appendTo('#wtopadcreation');
		},
		
		photoDelete : function (wrapper)
		{
			var deletePhoto = $.create('a', {'role': 'link', 'class':'link', 'id' : 'wtopphotos_delete'}, 'Remove Your Print Photo');
			
			wrapper.empty().append(deletePhoto);
			
			deletePhoto.click(function () {
				KAANGO.util.ajax('wtopdeletephoto', {
					"success": function (json) {
						KAANGO.wtop.updateAdText();
						
						wrapper.remove();
						
						KAANGO.wtop.photoUpload();
						
						if (KAANGO.sl['3'] === false && KAANGO.wtop.edit.length == 0)
						{
							removePhoto(0, '', true);
						}
						
						KAANGO.ca.updateOnlinePreview();
					}
				});
			});
			
			KAANGO.ca.updateOnlinePreview();
		},
		
		/**
		 * Setups the Web To Print Photo
		 */
		photoUpload : function ()
		{
			var btnText = '<span class="photo-upload-button">Please Choose One Photo to Upload</span>',
				wrapper = KAANGO.wtop.photoCreateWrapper(),
				placeholder = (function() {
					var progressbar = $.create('div', {'id' : 'wtopphotos_progressbar'}).appendTo(wrapper),
						upload = $.create('div', {'id' : 'wtopphotos_upload'}).appendTo(wrapper),
						outer = $.create('span', {'id' : 'wtopphotos_outerbutton', 'class' : 'primary-blue-button'}).appendTo(upload),
						inner = $.create('span', {'id' : 'wtopphotos_innerbutton'}).appendTo(outer);
					return $.create('div', {'id' : 'wtopphotos_placeholder'}, btnText).appendTo(inner);
				})();
			
			SWFUpload_wtop = new SWFUpload({
				// Flash Settings
				flash_url : KAANGO.swfupload[0],
				
				// Backend Settings
				upload_url: KAANGO.swfupload[1],
				post_params: {'adcart': KAANGO.adcart, 'w2p' : 1},
	
				// File Upload Settings
				file_size_limit : "20mb",
				file_types : "*.jpg",
				file_types_description : "JPG Images",
				file_upload_limit : 1,
				file_queue_limit : 1,

				preserve_relative_urls : true,
	
				// Event Handler Settings - these functions as defined in
				// /resources/js/swfupload/handlers.js
				upload_start_handler : uploadWTOPStart,
				file_queue_error_handler : function(file, error, message) {
                    // add w2p flag
                    return fileQueueError.call(this, file, error, message, true);
                },
				file_dialog_complete_handler : fileDialogComplete,
				upload_progress_handler : uploadWTOPProgress,
				upload_error_handler : uploadError,
				upload_success_handler : uploadSuccess,
				upload_complete_handler : function() {
					var ret = uploadComplete.apply(this,arguments);
					if (ret === true)
					{
						SWFUpload_wtop.destroy();
						
						KAANGO.wtop.photoDelete(wrapper);
					}
					return ret;
				},
				
				button_placeholder_id : placeholder.attr('id'),
				button_width: 225,
				button_height: 20,
				button_text : btnText,
				button_text_style : '.photo-upload-button { text-align: center; font-size: 12px; font-family: Helvetica, Arial, sans-serif; color:#ffffff; font-weight:bold; }',
				button_text_top_padding: 0,
				button_text_left_padding: 0,
				button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
				button_cursor: SWFUpload.CURSOR.HAND
			});
		},

		/**
		 * Appends the Default CSS Size Type to the Property
		 *
		 * @param string property
		 * @param bool add_fudge
		 */
		setupCSSSizeType: function (property, add_fudge)
		{
			if (add_fudge === true)
			{
				property = parseInt(property) * 1.2;
			}
			
			return [property, 'pt'].join('');
		},
		
		/**
		 * Goes and Grabs the Latest Ad Content
		 */
		updateAdText: function ()
		{
			KAANGO.util.ajax('wtoppreview',{"data":{},
				"success": function (json) {
					CostingBox.buildFromOrder(json.costs);
					
					// Grab the Latest Print Ad Preview Box
					KAANGO.wtop.updateAdPreview(json.content);
					
					CostingBox.highlight();
				}
			});
		},
		
		/**
		 * Updates the Ad Preview Div With the Contents the User Has Choosen
		 */
		updateAdPreview: function(json)
		{
			var showPreview = false;
			var outer_div = 'wtopad_wrapper', inner_div = 'printAdRenderInner', div_append = outer_div, key = 0, prefix = 'printborder', image_height = 0;

			$('#wtopupdate').empty().hide();
			$('#wtopupdatebutton_wrapper').remove();
			
			$('#' + outer_div).remove();
			
			$.create('div', {id: outer_div}).appendTo('#wtopadpreview');
			
			/*
			 * Empty The Divs For the Print Ad to Make Sure No Content is Duplicated
			 * Change the Background Color
			 */
			$('#wtopad_wrapper').empty().css({
				'background': '#' + json.bg,
				'width': this.setupCSSSizeType(json.w, true),
				'text-align': 'center',
				'margin': '0 auto'
			});

			/*
		 	 * Determines the Print Ad Has Borders Enabled
		 	 */
			if (json.b.length > 0)
			{
				showPreview = true;
				/*
				 * Builds Each of the Borders As Individual Div Tags
				 */
				for (key in json.b)
				{
					var border = json.b[key], count = parseInt(key), c_div = prefix + key, div = (count === 0) ? outer_div : prefix + (key - 1);
					$.create('div', {id: c_div}).appendTo('#' + div);

					json.b[key].width = (json.b[key].width ? json.b[key].width : '');
					json.b[key].padding = (json.b[key].padding ? json.b[key].padding : '');
					$('#' + c_div).css({
						'border': [this.setupCSSSizeType(border.width, false), 'solid', '#000000'].join(' '),
						'padding': this.setupCSSSizeType(border.padding, false),
						'display': 'block'
					});
				}
	
				div_append = prefix + count;
			}
			
			/*
			 * Either Appends the Inner Div to Hold the Picture, Icon, Text to
			 * -- The Last Border Div Created
			 * or
			 * -- The Top Level Div Already on the Page
			 */
			var d = $.create('div', {id: inner_div}).appendTo('#' + div_append);
	
			/*
			 * Appends the Base Font and Size So It Cascades Throughout the Ad
			 */
			$('#' + div_append).css({
				'font-family': json.f.font,
				'font-size': this.setupCSSSizeType(json.f.size, false)
			});
			/*
			 * Checks to See If a Eye Catcher Icon is Attached to the Ad
			 */
			if (json.i.length != 0)
			{
				showPreview = true;
				$(d).append($.create('div', {'id': 'wtopicon_wrapper'}));
				
				$('#wtopicon_wrapper').append($.create('img', {'src': json.i.url, 'id': 'wtopicon', 'border': 0}));
	
				image_height = json.i.height;
				
				$('#wtopicon').css({
					'height': this.setupCSSSizeType(json.i.height, true),
					'width': this.setupCSSSizeType(json.i.width, true)
				});
			}
			
			/*
			 * Checks to See If a Picture is Attached to the Ad
			 */
			if (json.p !== null)
			{
				showPreview = true;
				$(d).append($.create('div', {'id': 'wtoppicture_wrapper'}));
				
				$('#wtoppicture_wrapper').append($.create('img', {'width': json.p.width, 'height': json.p.height, 'src': [KAANGO.photo_path, json.p.path].join(''), 'id': 'wtoppicture', 'border': 0}));
			}

			KAANGO.wtop.length = 0;
			if (json.ad.length > 0 && json.ad[0].text != '')
			{
				showPreview = true;
				KAANGO.wtop.length = json.ad.length;
				/*
				 * Create a Div Foreach of the Lines For the Print Ad
				 */
				for (key in json.ad)
				{
					var line = json.ad[key], line_id = 'wtopadtext_' + key;
	
					if (line.type == 'first' || line.type == 'body' || line.type == 'para')
					{
						$(d).append($.create('div', {id: line_id}));
						
						$('#' + line_id).css({
							'margin-left': this.setupCSSSizeType(line.indent, true),
							'text-align': json.f.justify,
							'text-align-last':  json.f.justify,
							'text-justify': 'newspaper',
							'width': this.setupCSSSizeType(line.width, true)
						});
						
						// Allows the HTML Tags To Be Rendered Correctly
						$('#' + line_id).html(line.text);
						
						
						$.create('span', {id: 'span' + line_id}, ' _____________').appendTo('#' + line_id);
						
						$('#span' + line_id).css({
							'line-height': '0px',
							'color': '#' + json.bg
						});
					}
					else
					{
						$(d).append($.create('div', {id: line_id}));
						
						$('#' + line_id).css({
							'margin-left': this.setupCSSSizeType(line.indent, true),
							'text-align': json.f.justify,
							'width': this.setupCSSSizeType(line.width, true)
						});
						
						// Allows the HTML Tags To Be Rendered Correctly
						$('#' + line_id).html(line.text);
					}
				}
			}

			if (showPreview)
			{
				$('#wtopad_wrapper').show();
				$('#wtopadwrapper').hide();
			}
			else
			{
				$('#wtopad_wrapper').hide();
				$('#wtopadwrapper').show();
			}
			
			$('#' + outer_div).vAlign().css('margin-top', parseInt($('#' + outer_div).css('margin-top').replace('px', '')) - $('#wtopadlinesminmax').height());
		},
		
		w2pTinyMCEinit: function()
		{
			$('#wtptext').tinymce({
				// General Options
				theme: "advanced",
				theme_advanced_buttons1: 'separator,bold,italic,separator',
				theme_advanced_buttons2: '',
				theme_advanced_buttons3: '',
				theme_advanced_toolbar_location: "bottom",
				theme_advanced_toolbar_align: "center",
				plugins: 'safari',

				onchange_callback: function(editor) {
					if (editor.isDirty() === true)
					{
						KAANGO.wtop.saveW2POption('w2p_text', editor.getContent(), false, false);
					}
				},
										
				handle_event_callback: function () {
					// Lock the Preview Box
					if (tinyMCE.activeEditor.isDirty() && $("#wtopupdate").is(':hidden'))
					{
						var cur_pos = $('#wtopadpreview').position(), 
							height = $('#wtopadpreview').height(),
							width = $('#wtopadpreview').width();
				
						$('#wtopupdate').css({'width': width + 'px',
																  'height': height +15+ 'px',
																  'background-color': 'black',
																  'z-index': 100,
																  'position': 'absolute',
																  'display': 'block',
																  'border': '1px solid #999',
																  'top': cur_pos.top + 'px',
																  'left': cur_pos.left + 'px'}).fadeTo('normal', 0.6);
						
						$.create('div', {id: 'wtopupdatebutton_wrapper'}).appendTo('#wtopadpreview');
						
						// (div, name, id, value)
						KAANGO.html.form_creation.button('wtopupdatebutton_wrapper', 'wtopupdatebutton', 'wtopupdatebutton', 'Click to Update Your Ad');

						$('#wtopupdatebutton_wrapper').css({'z-index': 200, 
															'width': width + 'px',
															'position': 'absolute',
															'text-align': 'center',				  
															'top': cur_pos.top + 'px',
															'left': cur_pos.left + 'px'}).vAlign();
						
						$('#wtopupdatebutton_wrapper').one('click', function () {
							KAANGO.wtop.saveW2POption('w2p_text', tinyMCE.activeEditor.getContent(), true, true);
						});
						
						$('#wtopupdatebutton_wrapper').show();
					}
				}
			});
		}
	}
});


(function() {
	$.validator.addMethod('w2pvalidation', function(value, element) {
		if (typeof(KAANGO.wtop.length) !== 'undefined' && $('#wtopupdatebutton:visible').length === 0)
		{
			return (KAANGO.wtop.min == '' || KAANGO.wtop.length >= KAANGO.wtop.min) && (KAANGO.wtop.max == '' || KAANGO.wtop.length <= KAANGO.wtop.max);
		}
		else
		{
			var result;
			KAANGO.util.ajax('/ads/ajax/w2pvalidation/',{async:false,
				data: {},
				success: function(json) {
					KAANGO.wtop.length = json.length;
					KAANGO.wtop.min = json.min;
					KAANGO.wtop.max = json.max === null ? '' : json.max;
					result = json.result;
				}
			});
			return result;
		}
	}, function() {
		return 'Please Enter Enough Content to Fill A '+(KAANGO.wtop.length < KAANGO.wtop.min ? 'Minimum of '+KAANGO.wtop.min : 'Maximum of '+KAANGO.wtop.max)+' Line(s)';
	});
})();
