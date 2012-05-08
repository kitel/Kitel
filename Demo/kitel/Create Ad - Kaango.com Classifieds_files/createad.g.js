var KAANGO = KAANGO || {};

// jQuery Call So these functions get setup when the dom is available and binded to actions.
$(document).ready(function() {

    // update the base css so the error bubbles flow on top of the sidebar
    $('#kng-primary-content').css('overflow', 'visible');

    // deffer calls to datepicker until it's actually loaded...
    $.fn.datepicker = function(opts) {
        var _self = this;
        JUI.datepicker(function() {
            _self.datepicker(opts);
        });
    }

	KAANGO.util.loadScript('jquery/jquery.jgrowl.js', 'jGrowl');
	$('head').append($.create('link',{href:'/resources/css/jquery.jgrowl.css', type:"text/css", rel:"stylesheet"}));
	
	KAANGO.ca.addressInit();

        // List Of Ad Nature Types Accepted For Building the Form
    KAANGO.adNaturesAccepted = ['text', 'text_integer', 'text_float', 'date', 'textarea', 'wysiwyg', 'select', 'select_multi', 'radio', 'checkbox', 'check_multi', 'check'];
        
	KAANGO.adcart = null;
	KAANGO.ca.autoSaveDelay = 5000;
	KAANGO.ca.autoSaveQueue = {};
	KAANGO.mindate = '';
	KAANGO.loaded = [];
	KAANGO.upsells = [];
	KAANGO.bundles = {};
	KAANGO.transitions = [];
	KAANGO.current_bundle = -1;
	KAANGO.wysiwyg = [];
	KAANGO.pricing = {r : [], p : {}};
	KAANGO.pricing_hash = '';
	KAANGO.swf_ph_c = 0;
	KAANGO.swf_ph = 'spanButtonPlaceholder';
	KAANGO.photos = {list: [], div_amount : 4, count : 0, cost_above : '0.00', free: 0, bundle_free: 0, current_index: 0}; // Keep Our Own Index - The Index From SWFUpload May Contain Files that have errors and restarts each new photos are uploaded
	KAANGO.currentSellerType = 'private';
	KAANGO.flashVer = getFlash();
	KAANGO.ca.dialogDefaultsSet = false;
	
	// check flash version - requires 8
	if($.inArray(KAANGO.flashVer, ['-1', -1, null, false]) != -1
	 || parseInt(String(KAANGO.flashVer).match(/[0-9]+/)) < 8) // check if flash version is less than 8
	{
		$('#step_1_form h2').after(
			$('<div class="kng-top-page-warning"/>').css('margin-top', '20px')
			.append($('<strong/>').text('WARNING: '))
			.append('In order to add photos to your ad, you will need version 8 or above of the Adobe Flash Player plugin.<br/>')
			.append($('<a href="http://get.adobe.com/flashplayer/" />')
			.append($('<img border="0" />')
				.attr('src', 'http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif')
				.css('margin-top', '5px'))
			)
		);
	}
	
	/*
	 * Determines Which Steps the User Has Seen
	 *
	 * webtoprint - gets reset based on the users behavior
	 * a_webtoprint - gets set when the user enters the web to print step, never reset
	 */
	KAANGO.sl = {1 : true, webtoprint : false, a_webtoprint : false, 3 : false};  
	KAANGO.dialog = false;
	KAANGO.analytics_category = 'placeAd';
	ie=/*@cc_on!@*/false;

	/**
	 * Builds Out the Structure For the Ad Nature Display on Step 1 - B
	 */
	KAANGO.html_setup = {title_above : '<label class="adnat-title">%title%</label><div class="adnat-extra-title">%title_extra%</div><div id="%input_id%"></div>',
	  					 title_left : ['<label for="%label_id%">%title%</label>',
	  						 		   '<span class="adnat-before">%before%</span>',
	  						 		   '<span class="adnat-input" id="%input_id%"></span>',
	  						 		   '<span class="adnat-after">%after%</span>',
	  						 		   '<p class="adnat-below">%below%</p>'].join('')
						 };

	// Make Sure When We Get to this Page Everything is In Default Format
	$("#category_selector_1").removeAttr('disabled').prop('selectedIndex',-1);

	$('#step_1_form :radio').removeAttr('disabled').each(function(key) {
		$('*[name='+$(this).attr('name')+']:first').attr({'checked': true});
	});


	// Load Up the jQuery UI Dialog Box
	if(!JUI.dialog()) JUI.dialog();

    if(!JUI.datepicker()) JUI.datepicker();

	/**
	 * STANDARD VALIDATION RULES FOR EACH STEP
	 */

	$('#step_1_form').validate({
		rules: {
			resume: "required",
			zip_code: {
				required: true,
				remote: '/ads/ajax/validate-postal-code'
			},
			category_selector_1: "required",
			category_selector_2: "required",
			category_selector_3: "required",
			category_selector_4: "required",
			category_selector_5: "required"
		},
		messages: {
			zip_code: {
				remote: 'Please enter a valid zip code.'
			},
			resume: "Please Choose a Category",
			category_selector_1: "You Missed A Category 1. Selection.",
			category_selector_2: "You Missed A Category 2. Selection.",
			category_selector_3: "You Missed A Category 3. Selection.",
			category_selector_4: "You Missed A Category 4. Selection.",
			category_selector_5: "You Missed A Category 5. Selection."
  		},
  		showErrors: KAANGO.validation.showErrors,
  		errorPlacement: function(error,element){
  			if (element.attr('id').indexOf('category_selector_') !== -1)
  			{
  				Array.prototype.push.call(arguments,$('#category_selector_outer'));
  	  			KAANGO.validation.errorPlacement.apply(this,arguments);
  			}
  			else
  			{
  	  			KAANGO.validation.errorPlacement.apply(this,arguments);
  			}
  		},
  		invalidHandler: function(form, validator) {
  			KAANGO.validation.invalidHandler.apply(this,arguments);
  			$('#category-choose-error').hide();
  			$.each(validator.errorList,function(key) {
  				if ($(this.element).attr('name').indexOf('category_selector_') !== -1)
  				{
					$('#category-choose-error').show();
  				}
  			});
  		},
  		success: KAANGO.validation.success,
  		submitHandler: KAANGO.validation.submitHandler,
  		onkeyup: function () { return false },
  		onmouseup: function () { return true },
  		onclick: function () { return true },
  		onmousedown: function () { return true },
  		onfocus: function () { return true }
  	});

	$('#lockinbutton').bind('click',function() {
		$.ajax.kaango.enqueue(this,arguments,function() {
			if ($('#step_1_form').valid())
			{
				KAANGO.ca.updateOnlinePreview();

			 	window.onbeforeunload = confirmExit;
			 
				KAANGO.ca.analytics('placeAdSelectCategory');

				$('#category_selector_outer').children().hide();
				KAANGO.ca.cs.adNatures();
				KAANGO.ca.address.setStep(1);
			}
		});
	});
	$('#adnatures_form').validate({
  		showErrors: KAANGO.validation.showErrors,
  		errorPlacement: KAANGO.validation.errorPlacement,
  		invalidHandler: KAANGO.validation.invalidHandler,
  		success: KAANGO.validation.success,
  		submitHandler: KAANGO.validation.submitHandler
	});

	$('#w2p_form').validate({
  		showErrors: KAANGO.validation.showErrors,
  		errorPlacement: KAANGO.validation.errorPlacement,
  		invalidHandler: KAANGO.validation.invalidHandler,
  		success: KAANGO.validation.success,
  		submitHandler: KAANGO.validation.submitHandler
	});
	$('#ad_assign_form').validate({
		rules: {
			admin_assign: 'required'
		},
		onkeyup: false,
		onblur: false,
  		showErrors: KAANGO.validation.showErrors,
  		errorPlacement: KAANGO.validation.errorPlacement,
  		invalidHandler: KAANGO.validation.invalidHandler,
  		success: KAANGO.validation.success,
  		submitHandler: KAANGO.validation.submitHandler
	});
	$('#bundles_upsells_form').validate({
		onkeyup: false,
		onblur: false,
  		showErrors: KAANGO.validation.showErrors,
  		errorPlacement: KAANGO.validation.errorPlacement,
  		invalidHandler: KAANGO.validation.invalidHandler,
  		success: KAANGO.validation.success,
  		submitHandler: KAANGO.validation.submitHandler
	});

	// Standard Step 2 Form Validation Rules
	// ALL Form Submit Rules are Setup on Form Submit Based on JSON
  	/*
	 * --- END STANDARD VALIDATION RULES FOREACH OF THE STEP
	 */

	$("input[name='resume']").change(function() {
		/*
		 * If the User is Resuming Ad Then a Modal Needs to Pop Up
		 * AND
		 * Determine if the User Needs to Login or Just Get a List of Ads
		 */
		var r_c = $("input[name='resume']:checked");
		if (r_c.val() == 'resume_ad')
		{
			alert(r_c.val());
		}
	});

	// Binds a Change Event to the First Category Selection Box
	$("select#category_selector_1").bind('change',KAANGO.ca.cs.onChange);

	// Validates and Sends the Results to a External the 1st Step on the Create Ad Process
	$("#catComplete").bind('click',function() {
		 if($('.inerror').length==0){
			 $.ajax.kaango.enqueue(this,arguments,function() {
				if ($('#adnatures_form').valid())
				{
					if (KAANGO.wtop.enabled === true)
					{
						if (KAANGO.wtop.create === true)
						{
                            KAANGO.log('KAANGO.wtop.create');
							if(typeof KAANGO.wtop.edit.category == 'undefined' || KAANGO.wtop.category=='') {
                                KAANGO.log('loading webtoprint.js');
                                KAANGO.util.loadScript('webtoprint.js', 'webtoprint', function() {
                                    KAANGO.log('webtoprint.js loaded');
                                    KAANGO.wtop.getW2pCategories();
                                });
                            }
						}
						else
						{
							delete KAANGO.triggers.step2;
						}
						
						KAANGO.ca.address.setStep(2);
					}
					else
					{
						KAANGO.ca.address.setStep(3);
					}
				}
			});
		}
	});

	// Validates and Sends the Results to a External the 2nd Step on the Create Ad Process
	$("#w2pComplete").click(function() {
		$.ajax.kaango.enqueue(this,arguments,function() {
            if (!$('#w2p_form').valid())
            {
                return; // return if we have invalid form
            }

            $('#modal_dialog').html(['<p>', 'You will not be able to make changes to your print ad once it is placed. Did you double-check your print ad to be sure all necessary details are included?', '</p>'].join(' ')).dialog({
                title: 'Please review your print ad',
                close: KAANGO.ca.dialog.destroy,
                buttons:{
                    'Yes, continue': function() {
                        KAANGO.ca.dialog.destroy.call(this);
                        KAANGO.ca.wtopComplete = true;
                        KAANGO.ca.address.setStep(3);
                    },
                    'No, back to print ad': function() {
                        $("#w2pComplete").show();
                        KAANGO.ca.dialog.destroy.call(this);
                    }
                }
            });

        });
	});

	$('#video_link_txt').keyup(function () {
		KAANGO.ca.saveField('video_link', $(this).val());
	});

	$('#checkout').click(function () {
		KAANGO.ca.adNaturesSaveAll(function(){
			KAANGO.util.ajax('getfork', {
				success: function (json) 
				{
                    if (json.expired)
                    {
						KAANGO.ca.expiredAd(json.adid);
                    }
					else if (json.fork == 1)
					{
						KAANGO.ca.freeCheckout(json.reqs);
					}
					else if (json.fork == 2)
					{
						KAANGO.ca.prepaidCheckout(json.reqs);
					}
					else
					{
						KAANGO.ca.checkout( json.req_dest );
					}
				}
			});
		});
	});
	
	$('#createad-sellerstatus-controls input').bind('click', function(){
		if($(this).prop('disabled') != true)
		{
			KAANGO.currentSellerType = $(this).val();
		}
	});
	
	// message if nothing entered, 'Please Enter Information Below'?
	// 'Verifing...' (next to) while verifying
	// 'Verified and Assigned' (next to) or 'Sorry, We Were Unable to Locate a User'


	/*
	 * Verify the User Entered As Admin
	 */
	$('#assign_verify').click(function () {
		$('#admin_assign').rules('remove','invalid');
		if ($('#ad_assign_form').valid())
		{
			$('#admin_insert_error').remove();
			$('#admin_insert_ad_form').append($.create('span', {'id' : 'admin_insert_status'}, 'Attaching...'));
			$('#assign_verify').hide();

			KAANGO.util.ajax('assignuser',{data: {'assign' : $('#admin_assign').val()},
				success: function(json){
					if (json.assigned.assigned === true)
					{
						// Good Assignment Move On
						$('#admin_assign').attr('disabled', 'disabled');
						$('#admin_insert_status').html('<b>Verified and Assigned</b>');

                        CostingBox.buildFromOrder(json.costs);

                        if (json.req_fields.update_account)
                        {
                            KAANGO.ca.requiredFieldsDialog(json.req_fields, null);

                        }
					}
					else
					{
						// Bad Assignment
						$('#admin_assign').rules('add',{invalid: true, messages: {invalid: 'Sorry, We Were Unable to Locate a User'}});
						$('#ad_assign_form').valid();
						$('#admin_insert_status').remove();
						$('#assign_verify').show();
					}
				}
			});
		}
	});
	

	$('#step_1_finish_later').click(KAANGO.ca.displayAdSaved);
	$('#last_step_finish_later').click(KAANGO.ca.displayAdSaved);

	KAANGO.ca.animateCostingBox = CostingBox.initAnimation();
});

/**
 * Global Namespace to Hold the Functions for the Create Ad Process
 */
$.extend(true,KAANGO,{
	ca: {
		analytics: function (action)
		{
			KAANGO.util.analytics(KAANGO.analytics_category, action, (arguments.length == 2) ? arguments[1]: {});
		},

		save: function (name) {
			// Handles The Call Back to The Server - So Each Time a User Enters/Checks Something it is Recorded
			$(':input[name=' + name + ']').filter(KAANGO.ca.isAdNature).blur(function() {
				var $this = $(this),
				type = $this.attr('type');
	            if(type == 'select-multi' || type == 'radio' || type == 'checkbox')
	            {
	                KAANGO.ca.saveField($this.attr('name'), $this.val(), ($this.is(':checked'))?1:0);  
	            }
				else
				{
					KAANGO.ca.saveField($this.attr('name'), $this.val(), 1);
				}
			});
		},
		
		saveField: function(name, value, toggle)
		{			
            KAANGO.ca.autoSaveQueue[name] = [value, toggle];
		},
		
		/**
		 * Shows a modal dialog with one button.
		 * 
		 * @param string title Title of the dialog box
		 * @param string message Message to display
		 * @param string button The text of the button
		 * @param function close Optional callback function
		 */
		showMessage: function(title, message, button, close) {
			
			if (!KAANGO.ca.dialogDefaultsSet) {
				KAANGO.ca.dialog.setDefaults();
			}
			KAANGO.ca.dialogDefaultsSet = true;
			var buttons = {};
			buttons[button] = function() {
							KAANGO.ca.dialog.destroy.call(this);
							if($.isFunction(close)) {
								close();
							}
						};
			$('#modal_dialog').html('<p>'+message+'</p>')
				.dialog({
					title: title,
					close: KAANGO.ca.dialog.destroy,
					buttons: buttons
				});
		},
		
        /**
         * Removes unecessary HTML comments from HTML on copy-pasted HTML for tinymce.
         *
         * @name        tinyMceRemoveComments
         * @function
         * @return      String html
         */
        tinyMceRemoveComments: function(id, html, body) {
		    html = html.replace(/[\s]+/g, ' ');
            html = html.replace(/<!--.*?-->/g, '');
            return html;
        },
		
		/**
		 * Acts as an autosave feature to save progress of createad process
		 * at a defined interval <code>KAANGO.ca.autoSaveDelay</code>.
		 * 
		 */
		autoSave: function()
		{
			var data = [], fields = KAANGO.ca.autoSaveQueue, i = 0;
			KAANGO.ca.autoSaveQueue = {};
			$.each(fields, function(key, fieldValue) {
				var name = key,
				value = fieldValue[0];
				
				data.push('fields['+i+'][name]=' + encodeURIComponent(name));
				data.push('fields['+i+'][value]=' + encodeURIComponent(value));
				if(fieldValue[1] != undefined)
				{
					data.push('fields['+i+'][toggle]=' + fieldValue[1]);
				}
				i++;
			});
			if(data.length) {
    			KAANGO.util.ajax('savefield', {
    				data: data.join('&'),
    				success: function(data)
    				{
    			        // If field should be validated upon return, invalidate
    			        // it if the value is the same as the one sent to server
    			        var i, validate, $field;
    			        for(i = 0; i < fields.length; i++) {
    			            $field =  $(':input[name=' + fields[i][0] + ']');
    			            validate = $field.data('validateAjax');
    			            if(validate && fields[i][1] == $field.val() && data[i].adnature == -1) {
    			                $field.val('');
    			                $field.closest('form').validate().element($field);
    			            }
    			        }
    				}
    			});
			}
		},
		
		/**
		 * Wraps the KAANGO.util.ajax function with more robust error and
		 * timeout handling. Implements the same function signature.
		 * 
		 * @see KAANGO.util.ajax
		 */
		tryAjax: function(action, opts) {
			var _opts, retry, retries = 0;
			_opts = {
				timeout: 30000,
				error: function(xhr, textStatus, errorThrown) {
					if (textStatus == 'timeout')
					{
						retries++;
						if (retries < 4)
						{
							retry();
						}
						else
						{
							KAANGO.ca.showMessage('Oops!', 'The website is temporarily unavailable.', 'Try Again', opts.tryagain);
						}
					}
				}
			};
			_opts = $.extend(opts, _opts);
			retry = function() {
				KAANGO.util.ajax(action, _opts);
			}
			retry();
		},
		
		/**
		 * Must be called in the context of a jQuery object.
		 * 
		 * @returm {Boolean} Returns whether the field is an ad nature or not.
		 */
		isAdNature: function()
		{
	        return !$(this).hasClass('hasDatePicker');
		},
		
		/**
		 * Performs a save of all adnature fields.
		 */
		adNaturesSaveAll: function(success)
		{
			// Loop through adnature fields to build a query string
			// The following selector only selects input fields that are checked
			var query = $('#ad_natures').find(':input').filter(KAANGO.ca.isAdNature).serializeForPHP();
			KAANGO.ca.tryAjax('ad-natures-save-all',{
				data:     query,
				success:  success
			});
		},

		build_form : function (form_section, title, collapsible, form_fields) {
			var adnat = '', created = false; name = '', id = '',
				input = '', section = '', fs = '', fsi = '', total_loop = 0, j = '';

			$(form_fields).each(function(intIndex) {
				if(form_fields[intIndex].fi == 412)							// If this is a video link
				{
					KAANGO.ca.videoLinkMemory = form_fields[intIndex].v;	// Save for step 3
				}
				if (KAANGO.html_setup[form_fields[intIndex].hf] &&
                                    jQuery.inArray(form_fields[intIndex].tp, KAANGO.adNaturesAccepted) != '-1' &&
                                    form_fields[intIndex].fi != 412)	// Don't show video link here
				{
					created = false;

					name = (form_fields[intIndex].n) ? form_fields[intIndex].n : '';
					id = (form_fields[intIndex].i) ? form_fields[intIndex].i : '';

					section = (collapsible) ? 'optional' : 'required';

					fs = form_section + '_' + section;

					if ( $('#' + fs).length == 0 )
					{
						created = true;

						$.create('fieldset',{'id': fs + 'base'}).appendTo("#ad_natures");
						var aLink2Legend = $.create('a',{'role': 'link' }, title);
						if(collapsible){
							aLink2Legend.addClass('link')
						}
						$.create('h3',{'class': 'adnat-header', 'id': fs + '_subelement'}, aLink2Legend).appendTo('#' + fs + 'base');
						$.create('ul',{'id': fs}).appendTo('#' + fs + 'base');
					}

					form_fields[intIndex].t = (form_fields[intIndex].r) ? form_fields[intIndex].t + ' <span class="requiredMark">*</span> ' : form_fields[intIndex].t;
					var field_wrapper = [form_section, section, id].join('_');

					KAANGO.html.generate(KAANGO.html_setup[form_fields[intIndex].hf], field_wrapper, fs, form_fields[intIndex], intIndex, name, id);
					$('#'+field_wrapper).addClass('errorable').addClass(id);
					if ($('#'+field_wrapper+' .adnat-after').html() == '')
					{
						$('#'+field_wrapper+' .adnat-after').remove();
					}
					if (form_fields[intIndex]['type'] == 'select' && typeof(form_fields[intIndex]['javascript']) != 'undefined')
					{
						$('#' + id).change(function(){
							eval(form_fields[intIndex]['javascript']);
						});
					}

					// Handles The Call Back to The Server - So Each Time a User Enters/Checks Something it is Recorded
					KAANGO.ca.save(name);

					if (typeof(form_fields[intIndex].inl) != 'undefined')
					{
						for (key in form_fields[intIndex].inl)
						{
							var inl = form_fields[intIndex].inl[key], fsi = [inl.i, intIndex].join('_'), name_s = (inl.n) ? inl.n : '', id_s = (inl.i) ? inl.i : '';

							KAANGO.html.generate(null, fsi, field_wrapper, inl, key, name_s, id_s);

							// Binds the Blur Event
							KAANGO.ca.save(name_s);
						}
					}

					if (created)
					{
						if (collapsible)
						{
							$('#' + fs).hide();
							$('#' + fs + '_subelement').addClass('adnat-optional');
                            $('#' + fs + '_subelement a').addClass('kng-secondary-link-color');
						}
                        else
                        {
							$('#' + fs + '_subelement').addClass('adnat-non-optional');
                        }
					}
					var element = $('*[name="'+name+'"]');
					// Necessary to check that adnature was created
					if (element.length !== 0)
					{
						if (form_fields[intIndex].r)
						{
							if (form_fields[intIndex].it == 'select')
							{
								$('*[name="'+name+'"]').rules('add',{choose: true, min: 1,  messages: {min : 'Please Select A Option'}});
							}
							else
							{
							    $('*[name="'+name+'"]').data('validateAjax', true);
								$('*[name="'+name+'"]').rules('add',{required : true});
							}
						}
						if (form_fields[intIndex].it == 'text_float')
						{
							$('*[name="'+name+'"]').rules('add',{number: true});
						}
						else if (form_fields[intIndex].it == 'text_integer')
						{
							$('*[name="'+name+'"]').rules('add',{number: true});
						}
					}
				}
			});
			// I know it is a hack, but fixes the 2 columns designs of group of selection boxes
			$('.multi_selection').parent().parent().find('label:first').addClass('multi_selection_label');
		},

/* 		editAdType: function (current_selection)
		{
			// Create the actions for edit links
			$('#editAdType').click(function(e){
				if (KAANGO.sl['a_webtoprint'] === true || KAANGO.sl[3] === true)
				{
					KAANGO.ca.editStartOver('If you change your ad type you will lose all your information and will need to start again');
				}
				else
				{
					// Create a select, so user can change the ad type
					var tmpobj = $(this).parents('p'), tmp = $(tmpobj).find('strong').html();

					$(this).parents('p').html('<strong>'+tmp+'</strong>');

					$.create('select').bind('change',function() {
						editAd(this,'AdType');
					}).appendTo($(tmpobj));

					tmpobj = $(tmpobj).find('select');

					if(current_selection == 1){
						$.create('option',{"value":"1","selected":"selected"}).html("I'm Selling Something").appendTo($(tmpobj));
						$.create("option",{"value":"2"}).html("I want Something").appendTo($(tmpobj));
					} else {
						$.create("option",{"value":"1"}).html("I'm Selling Something").appendTo($(tmpobj));
						$.create("option",{"value":"2","selected":"selected"}).html("I want Something").appendTo($(tmpobj));
					}

					KAANGO.html.form_creation.button('adType', 'cancelAdTypeEdit', 'cancelAdTypeEdit', 'Cancel Edit');

					$('#cancelAdTypeEdit').click(function () {
						var tmp = $('#adType').find("strong").html();
						$('#adType').html("<strong>"+tmp+"</strong>" + " " + (current_selection=='1'?"I'm Selling Something":"I Want Something") + ' <a id="editAdType" role="link" class="link">edit ad type</a>');
						KAANGO.ca.editAdType(current_selection);
					});

					delete tmp;
					delete tmpobj;
				}
			});
		},
 */
		editSellerType: function (current_selection)
		{
			$("#editSellerType").click('live', function(e){
				if (KAANGO.sl['a_webtoprint'] === true || KAANGO.sl[3] === true)
				{
					KAANGO.ca.editStartOver('If you change your seller type you will lose all your information and will need to start again');
				}
				else
				{
					var tmpobj = $(this).parents('p'), tmp = $(tmpobj).find('strong').html();

					$(this).parents('p').html('<strong style="float: left; position: relative;">'+tmp+'</strong>');
					tmpobj = $.create("form",{"style":"float:left; position:relative;"}).appendTo($(tmpobj));

					$.create('select').bind('change',function() {
						editAd(this,'SellerType');
					}).appendTo($(tmpobj));

					$.create("input",{"type":"submit","value":"confirm"}).appendTo(tmpobj);

					tmpobj = $(tmpobj).find('select');

					if(current_selection == 'private')
					{
						$.create('option',{"value":"private","selected":"selected"}).html("I'm A Private Seller").appendTo($(tmpobj));
						$.create("option",{"value":"commercial"}).html("I'm A Commercial Seller").appendTo($(tmpobj));
					}
					else
					{
						$.create("option",{"value":"private"}).html("I'm A Private Seller").appendTo($(tmpobj));
						$.create("option",{"value":"commercial","selected":"selected"}).html("I'm A Commercial Seller").appendTo($(tmpobj));
					}

					KAANGO.html.form_creation.button('sellerStatus', 'cancelSellerStatusEdit', 'cancelSellerStatusEdit', 'Cancel Edit');

					$('#cancelSellerStatusEdit').click(function () {
						var tmp = $('#sellerStatus').find("strong").html();
						$('#sellerStatus').html("<strong>"+tmp+"</strong>" + " " + (current_selection=='private'?"I'm A Private Seller":"I'm A Commercial Seller") + ($('#ss_commercial').prop("disabled")?'':' <a id="editSellerType" role="link" class="link">edit seller type</a>'));
						KAANGO.ca.editSellerType(current_selection);
					});

					delete tmp;
					delete tmpobj;
				}
			});
		},

		editZipCode: function (current_zip_code)
		{
			$("#editZipCode").live('click', function(e){
				if (KAANGO.sl['a_webtoprint'] === true || KAANGO.sl[3] === true)
				{
					KAANGO.ca.editStartOver('If you change your zip code you will lose all your information and will need to start again');
				}
				else
				{
					var tmpobj = $(this).parents('p'), tmp = $(tmpobj).find("strong").html();

					// I put this inline CSS 'cause it's the only way to deal the JS loop
					$(tmpobj).next().css("clear","left");
					$(tmpobj).html("<strong style=\"float:left;\">"+tmp+"</strong>");
					tmpobj = $.create("form",{"style":"float:left; position:relative;"}).appendTo($(tmpobj));
					$.create("input",{"id":"zip_code","name":"zip_code","type":"text","value":current_zip_code}).appendTo($(tmpobj));
					$.create("input",{"type":"submit","value":"Confirm"}).appendTo(tmpobj);
					$.create("input",{"type":"button","value":"Cancel Edit", "id" : 'cancelZipCodeEdit', "name" : 'cancelZipCodeEdit'}).appendTo(tmpobj);

					$('#cancelZipCodeEdit').click(function () {
						var tmp = $('#zipCode').find("strong").html();
						//$('#zipCode').html("<strong>"+tmp+"</strong>" + current_zip_code +  ' <a id="editZipCode" role="link" class="link">edit postal code</a>');
						$('#zipCode').html("<strong>"+tmp+"</strong>" + current_zip_code);
						KAANGO.ca.editZipCode(current_zip_code)
					});

					var fobj = tmpobj;

					$(fobj).validate({
                        rules: {
                            zip_code: { required:true, remote:'/ads/ajax/validate-postal-code'}
                        },
                        messages: {
                            zip_code: {
                                remote:'Please enter a valid zip code.'}
                        },
                        showErrors: KAANGO.validation.showErrors,
                        errorPlacement: KAANGO.validation.errorPlacement,
                        invalidHandler: function(){ /* DO NOTHING */ },
                        submitHandler: function(){
                            editAd($(fobj),'ZipCode');
                        }
                    });


					delete tmp;
					delete tmpobj;
				}
			});
		},

		editCategory: function ()
		{
			$("#editCategory").live('click', function(e){
				KAANGO.ca.editStartOver('If you change your category you will lose all your information and will need to start again');
			});
		},

		editStartOver: function (message)
		{
			KAANGO.ca.dialog.setDefaults();

			$('#modal_dialog').html(['<p>', message, '</p>'].join(' '))
				  .dialog({
						title: 'Do you want to discard this ad?',
						close: KAANGO.ca.dialog.destroy,
						buttons:{
							'Yes, Start Over': function() {
								KAANGO.ca.dialog.destroy.call(this);
								window.onbeforeunload = null;
								window.location = '/ads/create/startover?id=' + KAANGO.adcart;
							},
							'Cancel': KAANGO.ca.dialog.destroy
						}
					});

                        $('div.ui-dialog-buttonpane').css({'text-align': 'center', 'padding-left': 0});
		},

		upsellBaseData: function (base)
		{
            KAANGO.log('KAANGO.ca.upsellBaseData');
			KAANGO.photos.free = parseInt(base['freepix'] === null ? 0 : base['freepix']);
			KAANGO.photos.cost_above = parseFloat(base['additionalpix'] === null ? 0 : base['additionalpix']).toFixed(2);
			KAANGO.photos.bundle_free = parseInt(base['bundlepix'] === null ? 0 : base['bundlepix']) || 0;
            KAANGO.photos.max = parseInt(base['maxPhotos'] === null ? 0 : base['maxPhotos']);
            
			/*
			 * Updates the display for amount and charge of photos
			 */
			if(KAANGO.photos.free + KAANGO.photos.bundle_free > 0)
			{
				$('#photo_count').text(KAANGO.photos.free + KAANGO.photos.bundle_free);
				$('#photo_cost_above').text(base['additionalpix']);
			}
			else
			{
				$('#photo_count').parents('b').hide();
				$('#photo_count').text(KAANGO.photos.free + KAANGO.photos.bundle_free);
				$('#photo_cost_above').parents('p').html('Each photo is $ <span id="photo_cost_above">' + base['additionalpix'] + '</span>. Photos must be saved as .jpg or jpge, and may no exceed a filesize of 20mb.');
			}
			$('#photo_cost_above').text(KAANGO.photos.cost_above);

			$('#thumbnails_ul > li').each(function(index) {
				var thumb_cost = $(this).find('div[id^=thumbnail_cost_]');
				
				if ((index + 1) <= (KAANGO.photos.free + KAANGO.photos.bundle_free))
				{
					$(thumb_cost).text('FREE!').addClass('free');
				}
				else
				{
					$(thumb_cost).text(KAANGO.util.monetize(KAANGO.photos.cost_above)).removeClass('free');
				}
			});
		},

		setAdCart: function(value) {
			KAANGO.adcart = value;
            
			if (window.location.search.match(/(&|\?)a?id\=/i) === null)
			{
				KAANGO.address.setHashValue({'id':KAANGO.adcart});
			}
		},

		// Drives the Category Selection Boxes
		cs: {		
			onChange: function(evt){

                // the second argument is used when building out the boxes after the category id is passed into create ad
                if (arguments.length == 2)
                {
                    var categoryBox = arguments[1];
                }
                else
                {
                    // using $(this) - because the function is called like - $("select#category_selector_1").bind('change',KAANGO.ca.cs.onChange);
                    var categoryBox = $(this);
                }

				var id = categoryBox.attr('id'),
					current = parseInt(categoryBox.attr('id').replace(/[^0-9]*/,'')),
					next = current + 1,
					cs = '#category_selector_' + next,
					catId = categoryBox.val();

				// Remove Any Boxes Not Needed Any More
				$('select[id^="category_selector_"]:gt('+(current-1)+')').each(function(index) {
					$('#'+$(this).attr('name')+'_error').remove();
					$(this).parent().remove();
				});

				// Create the New Ones Based on Section Chosen
				KAANGO.ca.cs.create(next, catId);

				// Remove validation errors
				$('#step_1_form').validate().element(categoryBox);

				$('div.error:visible').slideUp('slow');
				$("#category_selector select.error").removeClass("error");

				// Checks The Current Selection is Limited to Commercial Ad Placement Only
				if (typeof KAANGO.categories[catId] !== 'undefined' && KAANGO.categories[catId]['c'] === true)
				{
					$(':radio[name="seller_status"]').attr({'disabled': 'disabled'})
						.filter('#ss_commercial').attr({'checked': 'checked'});
				}
				else
				{
					$(':radio[name="seller_status"]').removeAttr('disabled')
						.filter('#ss_'+KAANGO.currentSellerType).attr({'checked': 'checked'});
				}

				if ($(cs).length)
				{
					$('#category_selector').stop().scrollTo(cs, 1200, {axis:'x'});
				}

				// If the Disclaimer is Showing on the Site - Make Sure to Hide It.
				if (current == 1)
				{
					if (typeof KAANGO.disclaimer[catId] != 'undefined')
					{
						// If the Category Choosen Needs to Have a Disclaimer - ie - Adult Services
						$('#disclaimer').append(KAANGO.disclaimer[catId]).show('blind');
					}
					else
					{
						$("#disclaimer:visible").hide('blind');
					}
				}
			},

			/**
			 * Determines if a New Category Selection Box is needed
			 * Then Creates One Based on the Selection Made in the Previous
			 * Or
			 * If No More Sub Categories, Updates the Cost of the Ad and Enables the "Lock In Category Button"
			 *
			 * @param int next The Number of the Category Box To Be Created If Necessary
			 * @param int current The Id of the Category Clicked On
			 */
			create: function (next, current)
			{
				if (typeof KAANGO.categories[current] == 'undefined')
				{
					return;
				}
				
				/**
				 * KAANGO.categories[current]['t'] = The Title/Name of the Category
				 * KAANGO.categories[current]['c'] = true|false - If This is a Commercial Only Categories
				 * KAANGO.categories[current]['cc'] = Array of Children Id's Available to Selected Category
				 * KAANGO.categories[current]['aa'] = Object That Could Contain the Redirect
				 */
				
				if (typeof KAANGO.categories[current]['au'] == 'object') // There Is A Redirect To Another Site
				{
					(function (name, url) {
						$('#category_selector > div[id^=category_]:last > select option:selected').prop('selectedIndex', '-1');
						KAANGO.ca.dialog.setDefaults();

                        KAANGO.modalWindows.redirect(
                            name,
                            url,
                            function() {
                                $('#category_selector * select:last').prop('selectedIndex', '-1');
							    KAANGO.ca.dialog.destroy.call(this);
                            },
                            'You will be taken to our partner site to post an ad in this category. Posting this type of ad may require you to register with their service.'
                        );
					})(KAANGO.categories[current]['au']['n'],KAANGO.categories[current]['au']['u']);

				}
				else if (KAANGO.categories[current]['cc'].length) // If There Are Children Then Build the Next Category Box
				{
					var wrapper = 'category_' + next,
						id = 'category_selector_' + next,
						categoryList = {};

					// Walk Each Child For the Category
					for (var child in KAANGO.categories[current]['cc'])
					{
						var childId = KAANGO.categories[current]['cc'][child];

						if (typeof KAANGO.categories[childId] !== 'undefined')
						{
							// Binds the Child Category to the New Selection List for HTML Element
							categoryList[childId] = KAANGO.categories[childId]['t'];
                            
							// If This Category Has Children - Display the Character to Indicate More Categories
							if (!jQuery.isEmptyObject(KAANGO.categories[childId]['au']))
							{
								categoryList[childId] =  '** ' + categoryList[childId];
							}
							else if (KAANGO.categories[childId]['cc'].length)
							{
								categoryList[childId] = categoryList[childId] + ' >';
							}
						}
					}

					// If There is Elements in the categoryList Array Then Create the New HTML Select Element
					$.create('div', {'id': wrapper}).appendTo('#category_selector');

					KAANGO.html.form_creation.select(wrapper, id, id, categoryList, 10, id);

					$('#'+id+' option:first').attr('selected','selected');

					$('#'+id+' option:first').removeAttr('selected');

                    $('#'+id).prop('selectedIndex', -1);

					// Binds a Click Event to the Category Box Just Created
					$('#' + id).bind('change',KAANGO.ca.cs.onChange);
				}
				else
				{
					KAANGO.util.ajax('bundleavailable', {data: {'categoryId' : current, 'placementType' : ($(':radio[name="seller_status"]').val() == 'private') ? 0 : 1},
						success: function(json){
							if( $('#createad-promotion').length == 0 )
							{
								$('#createad-zipcode').after($.create('div',{'id':'createad-promotion'}));

								$('#createad-promotion').append($.create('h4',{},'There are special promotions and discounts available when you place an ad in this category! These options will be available on the last step before you checkout.'));
							} 
							$('#createad-promotion'+(json?':hidden':':visible')).toggle('blind');
						}
					});
				}
			},

			/**
			 * Builds Out the Ad Natures Form Elements For the User, Once the Category Is Locked In
			 */
			adNatures: function ()
			{
				var data = {}, loading, loader_delay,
				key = 0, sel_options = '', cat_selected = '';

				$("#category_selector > div > select[id^='category_selector_']").each ( function (index) {
					cat_selected = [$.trim(cat_selected), $.trim($(this).selectedOptions().text())].join(' ');
				});

				// Get the Form Values for the Radio Buttons
				$('#step_1_form :input').filter(':radio:checked,:not(:radio)').each(function(key) {
					data[$(this).attr('name')] = $(this).val();
				});

				data['categories'] = $('select[id^="category_selector_"]').length;

				/**
				 * Calls the AJAX Handler To Recieve the Ad Natures Based on the Category Selection
				 */
				
				
				loading = $("<h3/>").text("Loading next step, please wait...");
				$("#step_1_form > .fields").eq(0).slideUp("fast").after(loading);

				
				var opts = {
					data: data,
					tryagain: function() {
						$("#step_1_form > .fields").eq(0).show();
						loading.remove();
					},
					success: function(json){
						if (json.adNatures.length == 0)
						{
							alert('Sorry, No Ad Natures Returned!');
							return false;
						}
						
						
						if(!json.adCartId || json.adCartId == 0)
						{
							KAANGO.ca.showMessage('Oops! An an error has occured.', 'Oops! An error has occured, please refresh the page and try again.', 'OK');
							loading.text('Please refresh your browser...');
							return;
						}
						
                        KAANGO.ca.setAdCart(json.adCartId);
						Upsells.add({'id' : 10, 'update' : false});
						Upsells.add(6);

						//KAANGO.ad_type = data['ad_type'];
						KAANGO.seller_status = data['seller_status'];
						KAANGO.zip_code = data['zip_code'];

						/*
						 * Remove the Category Tree & Pricing Tree
						 * Helps Free Memory and Once the Selections Have Been Made the User Has to Fully Start Over
						 */
						delete KAANGO.categories;
						delete KAANGO.pricing;
						delete KAANGO.extension_days;

						/*
						 * Hides the Top Portion of the First Step, Includes:
						 * Radio Buttons Selling/Want Something
						 * Zip Code Box
						 * Category Selector
						 * Radio Buttons For Commercial/Private Seller
						 */
						// $('html,body').animate(scrollTop) executes callback twice
						$('html').animate({scrollTop:$('#kng-create-ad-wrapper').offset().top}, {duration: 500,complete:function() {
							// use the kill variable to stop the "slideUp" callback from being called endlessly?
							// jQuery bug?
							var kill = false;
							$('#step_1_form').css('width',$('#step_1_form').width()).slideUp(1000, function() {
								if(kill === true)
								{
									KAANGO.ca.showMessage('Oops! An an error has occured.', 'Oops! An error has occured, please refresh the page and try again.', 'OK');
									return;
								}
								kill = true;
								/*
								 * Builds Out the List Of Options Choosen By The User in the First Step of Ad Creation
								 * To Display Above the Ad Natures
								 */
								var value,
									ad_detail = $.create('div', {'id' : 'ad_detail_types'}),
									header = $('.write-your-ad-header').clone(),
									get_started = KAANGO.ca.getStartedSection;
									/* ad_type = KAANGO.ca.adTypeSection // to be removed */

								$('#step_1_form').remove();

								/*
								 * Converts the Step 1a Form - Options Into:
								 * Ad Type: I'm Selling Something edit ad type
								 * Category: Merchandise > $250 or Less! edit category
								 * Zip Code: 80134 edit ZIP
								 * Seller Type: I'm A Private Seller edit seller type
								 */
								//ad_type.adType(ad_detail, ad_type.determineAdType(data['ad_type']));
								//ad_type.category(ad_detail, cat_selected);
								//ad_type.zipCode(ad_detail, data['zip_code']);
								//ad_type.sellerStatus(ad_detail, ad_type.determineSellerStatus(data['seller_status']));

								get_started.category(ad_detail, cat_selected);
								get_started.zipCode(ad_detail, data['zip_code']);
								get_started.sellerStatus(ad_detail, get_started.determineSellerStatus(data['seller_status']));
								 
								/*
								 * Remove Everything From the DOM For the First Step
								 * The User Can Not Edit The Entered Text
								 * Display the List of Options Entered Instead
								 */
								$('#step_1 > .kng-ca-step-content').prepend(header);

								$('#adnatures_form').prepend(ad_detail);

								KAANGO.ca.buildInputFields(json.adNatures.input_fields);

                                KAANGO.ca.buildStartDate(ad_detail, false);

								/*
								 * Show All the Ad Nature Options Created Above By KAANGO.ca.build_form
								 */
								$('#adnatures_form').show('blind',{},1000, function() {
									KAANGO.ca.checkWTPEnabled();
									//KAANGO.ca.editAdType(data['ad_type']);
									KAANGO.ca.editSellerType(data['seller_status']);
									KAANGO.ca.editZipCode(data['zip_code']);
									KAANGO.ca.editCategory();
									KAANGO.ca.initOnlineAdTinyMCE();

									$("#step-1-buttons").show();

									KAANGO.ca.adNatOptionalHeader();

									for (key in KAANGO.wysiwyg)
									{
										$('#'+KAANGO.wysiwyg[key]).addClass('tinyMCE');
									}
                                                                        
									KAANGO.ca.upsellBaseData(json.upsellBaseData);
									
									KAANGO.util.loadScript('swfupload/swfupload.js', 'swfupload');
									KAANGO.util.loadScript('swfupload/handler.js', 'swfupload_handler');

									// add change trigger
									$('select').bind('keyup', function(){ $(this).change(); })
								});
							});
						}});
					}
				};
				KAANGO.ca.tryAjax('adnatures', opts);
			}
		},

		/**
		 * Walk Each of the Input Fields Returned By the AJAX Handler For Ad Natures
		 */
		buildInputFields: function (fields) {
            KAANGO.ca.autoSaveTimer = setInterval(KAANGO.ca.autoSave, KAANGO.ca.autoSaveDelay);
			$(window).unload(function()
			{
				// kill the autosaver
				clearInterval(KAANGO.ca.autoSaveTimer);
			});
            
			$(fields).each(function(intIndex) {
				/**
				 * $(this)[0].n = Name of the Ad Nature Section - HTML Ready For the ID of the Section
				 * $(this)[0].t = The Title of the Ad Nature Section - ie... Details, Listing Details
				 * $(this)[0].c = Collapsible Field Section
				 * $(this)[0].f = The Full Form Setup, Contains N Number of Fields Based on Ad Natures
				 */
				KAANGO.ca.build_form($(this)[0].n, $(this)[0].t, $(this)[0].c, $(this)[0].f);
                                
				/*
				 * Need Walk Back Over The Ad Natures - Because We Have to Disable the Fields After Drawn
				 * Based on the Clear Values in the External Load Array
				 */
				for (var form_key in $(this)[0].f)
				{
					var form_element_extra = $(this)[0].f[form_key].el;
                    
					if (typeof(form_element_extra) !== 'undefined' && form_element_extra.clear != 0)
					{
						for (var key in form_element_extra.clear)
						{
                            if ($('#' + form_element_extra.clear[key] + ' > option').length <= 1)
                            {
                                $('#' + form_element_extra.clear[key]).attr('disabled', 'disabled');
                            }
						}
					}
				}
			});
		},

        buildStartDate: function(ad_detail, edit) {
            KAANGO.util.ajax('daysexpiration', {data: {},
                success: function(json) {

                    var now = new Date,
                        startDateTimeParts = $.trim(json.startDate).split(' '),
                        startDateParts = startDateTimeParts[0].split('-'),
                        startTimeParts = startDateTimeParts[1].split(':'),
                        startDate = new Date(startDateParts[0], parseInt(startDateParts[1],10) - 1, startDateParts[2], startTimeParts[0], startTimeParts[1], startTimeParts[2]);

                    if (edit && startDate.getTime() < now.getTime())
                    {
                        return;
                    }

                    if (edit)
                    {
                        startText = dateFormat(startDate, $('#jsDayMonthFormatWithDay').text());
                    }
                    else
                    {
                        startText = 'today';
                    }

                    var endDateParts = $.trim(json.expires).split('-'),
                        endDate = new Date(endDateParts[0], parseInt(endDateParts[1],10) - 1, endDateParts[2]);

                    $(ad_detail).append($.create('div', {'id' : 'start-date'})
                                            .append($.create('h3', {'class' : 'adnat-header adnat-non-optional'}, ['<a>Online Ad Run Period</a>']))
                                            .append($.create('p', {'id' : 'start-date-instructions'},
                                                             ["Your online ad will start " + startText + " and run for " + json.freeDays + " days ending on " + dateFormat(endDate, $('#jsDayMonthFormatWithDay').text()) + ". To change the START DATE of your online click here. Don't worry, you can add extra days later."]))
                                            .append($.create('div', {'id' : 'start-date-selected'}, ['<h4 style="text-align:center;">The Ad Will Currently Start On: ' + dateFormat(startDate, $('#jsDayMonthFormatWithDay').text()) + '</h4>']))
                                            .append($.create('div', {'id' : 'start-date-calender', 'style' : 'display:none'}, []))
                                            .append($.create('h4', {'id' : 'start-date-datepicker-instructions', 'style' : 'display:none'}, ['Starting At: ']).append($.create('div', {'id' : 'start-date-datepicker'}, KAANGO.util.timeSelector('start-date', edit, startTimeParts[0], startTimeParts[1]))))
                                            .append($.create('div', {'id' : 'start-date-save-wrapper', 'style' : 'display:none'}, [])
                                                                .append($.create('div', {'id' : 'start-date-save', 'class' : 'ui-button ui-button-text-only ui-widget ui-state-default ui-corner-all'},
                                                                    ['<span class="ui-button-text">Save Start Date and Time</span>']))));

                    if (edit)
                    {
                        $('#start-date-datepicker-instructions').append($.create('h5', {}, 'Time Shown As Eastern United States'));
                    }
                    
                    $('#start-date-instructions').live('click', function() {
                        $('#start-date-now').remove();
                        $('#start-date-calender').toggle();
                        $('#start-date-datepicker-instructions').toggle();
                        $('#start-date-save-wrapper').toggle();
                        $('#start-date-selected').toggle();

                        if (edit && $('#start-date-datepicker-instructions:visible'))
                        {
                            $('#start-date-instructions').after($.create('a', {'id' : 'start-date-now', 'style' : 'color:red;font-weight:bold', 'href' : 'javascript:void(0);'}, ['Start Your Online Ad Now']));
                        }
                    });

                    var endDate = new Date();

                    // only allow the customer to start the ad out 2 months - should be plenty of time
                    endDate.setMonth(endDate.getMonth() + 2);

                    $("#start-date-calender").datepicker({
                        minDate: new Date(),
                        maxDate: endDate,
                        numberOfMonths: 2,
                        defaultDate: startDate
                    });

                    $('#start-date-now').live('click', function() {

                        KAANGO.util.ajax('save-start-date',
                            {data: {
                                'now'            : 1
                            },
                            success: function(json){
                                var now = $.trim(json.date).split(' '),
                                    nowDateParts = now[0].split('-'),
                                    nowTimeParts = now[1].split(':'),
                                    nowDateObject = new Date(nowDateParts[0], parseInt(nowDateParts[1],10) - 1, nowDateParts[2], nowTimeParts[0], nowTimeParts[1], nowTimeParts[2]);

                                $("#start-date-calender").datepicker('setDate', nowDateObject);
                                $('#start-date-datepicker').empty().html(KAANGO.util.timeSelector('start-date', edit, nowTimeParts[0], nowTimeParts[1]));
                                
                                $('#start-date-instructions').click();

                                $('#start-date-now').remove();
                                
                                meridiem = '',
                                hour = $('#start-date-hours').val(),
                                minute = $('#start-date-minute').val();

                                if ($('#start-date-meridiem').length > 0)
                                {
                                    meridiem = $('#start-date-meridiem').val();
                                }

                                $('#start-date-selected').html('<h4 style="text-align:center;">Selected Start Date and Time: ' + dateFormat(nowDateObject, $('#jsDayMonthFormatWithDay').text()) + ' at ' + hour + ':' + minute + ' ' + meridiem + '</h4>');

                                CostingBox.buildFromOrder(json.costs);
                            }
                        });
                    });

                    $('#start-date-save').live('click', function() {
                        var datePicker = $("#start-date-calender").datepicker('getDate'),
                            meridiem = '',
                            hour = $('#start-date-hours').val(),
                            minute = $('#start-date-minute').val();

                        if ($('#start-date-meridiem').length > 0)
                        {
                            meridiem = $('#start-date-meridiem').val();
                        }

                        KAANGO.util.ajax('save-start-date',
                            {data: {
                                'year'           : datePicker.getFullYear(),
                                'month'          : datePicker.getMonth() + 1, // zero based
                                'date'           : datePicker.getDate(),
                                'hour'           : hour,
                                'minutes'        : minute,
                                'meridiem'       : meridiem,
                                'timezoneOffset' : $('#start-date-timezone-offset').val(),
                                'edit'           : (edit) ? 1 : 0,
                                'now'            : 0
                            },
                            success: function(json){
                                CostingBox.buildFromOrder(json.costs);
                            }
                        });

                        $('#start-date-instructions').click();

                        $('#start-date-selected').html('<h4 style="text-align:center;">Selected Start Date and Time: ' + dateFormat(datePicker, $('#jsDayMonthFormatWithDay').text()) + ' at ' + hour + ':' + minute + ' ' + meridiem + '</h4>');
                    });
                }
            });
        },

		/*
		 * Binds a Click Event to the Legend Tag So The User Can Open the Extra Ad Natures
		 */
		adNatOptionalHeader: function () {
			$("fieldset .adnat-optional").click(function() {
				KAANGO.ca.analytics('placeAdViewOpt', {'label' : $('#' + $(this).attr('id') + ' > a').html()});

				$(this).parent().children('ul:first').toggle('blind',function() {
					$('#'+$(this).attr('id')+' .error:not(label)').each(function(key) {
						$('#adnatures_form').validate().element($(this));
					});
                });

				$(this).toggleClass('adnatOptionalOpen');
			});
		},
			
		getStartedSection: {
			create: function ()
			{
				return $.create('div', {'id' : 'ad_detail_types'});
			},

			createSection: function (categoryName, zipCode, sellerStatus)
			{
				var ad_detail = this.create();

				this.category(ad_detail, categoryName);
				this.zipCode(ad_detail, zipCode);

                                this.sellerStatus(ad_detail, this.determineSellerStatus(sellerStatus));

				this.displaySection(ad_detail);

				delete ad_detail;
			},

			createSectionWithCat: function (zipCode, sellerStatus)
			{
				var ad_detail = this.create();

				this.cloneCategory(ad_detail);
				this.zipCode(ad_detail, zipCode);
				this.sellerStatus(ad_detail, this.determineSellerStatus(sellerStatus));

				this.displaySection(ad_detail);

				delete ad_detail;
			},

			displaySection: function(div)
			{
				var header = $('.write-your-ad-header').clone();

				$('.write-your-ad-header').remove();
				$('#ad_detail_types').remove();
				$('#step_1_form').empty();

				$('#step_1 > .kng-ca-step-content > #step_1_form').prepend(div).prepend(header);

				delete header;
			},

			cloneCategory: function (div)
			{
				$(div).append($('#category_wrapper').clone());
			},

			category: function (div, value)
			{
				$.create('p', {'id' : 'editCategory'}).html('<strong>Category:</strong> ' + value +
															' <a id="editCategory" role="link" class="link" >edit category</a>')
													  .appendTo(div);

                KAANGO.ca.editCategory();
			},

			zipCode: function (div, value)
			{
				/*$.create('p', {'id' : 'zipCode'}).html('<strong>Postal Code:</strong> ' + value +
													   ' <a id="editZipCode" role="link" class="link" >edit postal code</a>')
												 .appendTo(div);*/
				$.create('p', {'id' : 'zipCode'}).html('<strong>Postal Code:</strong> ' + value).appendTo(div);

                KAANGO.ca.editZipCode(value);
			},

			determineSellerStatus: function (value)
			{
                    if (value == 0 || value == 1)
                    {
                        return (value == 0 ? "I'm A Private Seller" : "I'm A Commercial Seller");
                    }
                    else
                    {
                        return (value === 'private' ? "I'm A Private Seller" : "I'm A Commercial Seller");
                    }
			},

			sellerStatus: function (div, value)
			{
/*
				$.create('p', {'id' : 'sellerStatus'}).html('<strong>Seller Type:</strong> ' + value +
															($('#ss_commercial').attr("disabled") ? '' : ' <a role="link" id="editSellerType" class="link" >edit seller type</a>'))
													  .appendTo(div);
*/
				$.create('p', {'id': 'sellerStatus'}).html('<strong>Seller Type:</strong> ' + value).appendTo(div);
			}
		},

		edit: {
			//edit: function (adType, zipCode, placementType, wait_for_load)
			edit: function (zipCode, placementType, wait_for_load)
			{
                KAANGO.log('KAANGO.ca.edit.edit');
				window.onbeforeunload = confirmExit;

				$('#adnatures_form').show();
				KAANGO.ca.updateOnlinePreview();

				//KAANGO.ad_type = adType;
				KAANGO.seller_status = placementType;
				KAANGO.zip_code = zipCode;

				this.buildAdNatures(KAANGO.editAdNatures.input_fields, wait_for_load);
				//this.adTypeSection(adType, zipCode, placementType);
				this.getStartedSection(zipCode, placementType);
				this.baseValues();
				this.getImages();

                KAANGO.ca.buildStartDate($('#ad_detail_types'), true);
			},

			buildAdNatures: function (fields, wait) {
                KAANGO.log('KAANGO.ca.edit.buildAdNatures');
				var ca = KAANGO.ca;

				ca.buildInputFields(fields);
				ca.adNatOptionalHeader();

				if (wait)
				{
					/*
					 * STILL NEED TO RESEARCH
					 *
					 * tinyMCE Was Causing the Page to Refresh
					 * if the Page Was Not Fully Loaded
					 */
					$(document).ready(function() {
						ca.initOnlineAdTinyMCE();
					});
				}
				else
				{
					ca.initOnlineAdTinyMCE();
				}

				delete KAANGO.editAdNatures;
			},

			getStartedSection: function (zipCode, placementType) {
                KAANGO.log('KAANGO.ca.edit.getStartedSection');
				var ca = KAANGO.ca;

				ca.editZipCode(zipCode);
				ca.editSellerType(placementType);
				ca.editCategory();
			},
				
			webtoprintNonEdit: function () {
                KAANGO.log('KAANGO.ca.edit.webtoprintNonEdit');
				KAANGO.util.ajax('wtpnonedit', {
					success: function(json){
                        KAANGO.log('KAANGO.ca.edit.webtoprintNonEdit: success');
						KAANGO.wtop.create = false;

						$("#w2pComplete").unbind();
						//$('#w2p-header-button:w2pSkip').remove();
						$('#SandBoxNewContent').remove();
						$('#w2pComponent').html(json.salesText);

						$('#w2pComponent').append($.create('div', {'class' : 'button-outer-wrapper'})
												   .append($.create('div', {'class' : 'button-inner-wrapper'})
												   			.append($.create('span', {'id' : 'w2pNotEditable', 'class' : 'primary-blue-button'}))));
						
						KAANGO.html.form_creation.button('w2pNotEditable', 'w2pNotEditableButton', 'w2pNotEditableButton', 'Continue');

						$('#w2pNotEditableButton').click(function () {
								KAANGO.ca.address.setStep(3);
						});
					}
				});
			},

			webtoprintValues: function (callback) {
                KAANGO.log('KAANGO.ca.edit.webtoprintValues');
                var goToW2P = false;
                if(window.location.hash && window.location.hash.indexOf('ca/2') != -1) {
                    KAANGO.log('going directly to w2p');
                    goToW2P = true;
                }
                KAANGO.wtop.rebuilding = true;
				KAANGO.util.ajax('rebuildwtp', {
					success: function(json){
						KAANGO.wtop.edit = {};
                        KAANGO.log('KAANGO.ca.edit.webtoprintValues: success');
                        KAANGO.wtop.rebuilding = false;
						if (json.categoryCode != null)
						{
							KAANGO.wtop.edit.category = json.categoryCode;
						}

						if (json.categoryName != null)
						{
							KAANGO.wtop.edit.categoryName = json.categoryName;
						}

						if (json.packageID != null)
						{
							KAANGO.wtop.edit.packageID = json.packageID;
						}

						if (json.packageName != null)
						{
							KAANGO.wtop.edit.packageName = json.packageName;
						}

						if (json.publicationId != null)
						{
							KAANGO.wtop.edit.publicationID = json.publicationId;
						}

						if (json.startDate != null)
						{
							KAANGO.wtop.edit.startDate = json.startDate;
						}

						if (json.endDate != null)
						{
							KAANGO.wtop.edit.endDate = json.endDate;
						}

						if (json.rundates != null)
						{
							KAANGO.wtop.edit.rundates = json.rundates;
						}

						if (json.backgroundID != 0)
						{
							KAANGO.wtop.edit.backgroundID = json.backgroundID;
						}

						if (json.borderID != 0)
						{
							KAANGO.wtop.edit.borderID = json.borderID;
						}

						if (json.iconID != 0)
						{
							KAANGO.wtop.edit.iconID = json.iconID;
						}

						if (json.imagePath != null)
						{
							KAANGO.wtop.edit.imagePath = json.imagePath;
						}

						if (json.printText != null)
						{
							KAANGO.wtop.edit.printText = json.printText;
						}

                        if($.isFunction(callback)) {
                            KAANGO.log('KAANGO.ca.edit.webtoprintValues: calling callback');
                            callback(json);
                        }
                        if(goToW2P) {
                            KAANGO.log('loading webtoprint.js');
                            KAANGO.util.loadScript('webtoprint.js', 'webtoprint', function() {
                                KAANGO.log('webtoprint.js loaded');
                                KAANGO.wtop.getW2pCategories();
                            });
                        }
					}
				});
			},

			baseValues: function () {
                KAANGO.log('KAANGO.ca.edit.baseValues');
				KAANGO.util.ajax('getbase', {data: {},
					success: function(json){
                        KAANGO.log('KAANGO.ca.edit.baseValues: success');
						KAANGO.ca.upsellBaseData(json);
					}
				});
			},

			getImages: function () {
                KAANGO.log('KAANGO.ca.edit.getimages');
				KAANGO.util.ajax('getimages', {success: function(json){
                    KAANGO.util.loadScript('swfupload/handler.js', 'swfupload_handler', function() {
                        KAANGO.log('KAANGO.ca.edit.getimages: success');
                        for (var key in json)
                        {
                            uploadSuccess(json[key]['path'], json[key], false);
                        }
                    });
				}});
			},

			linerCatSelector: function (end, adType, zipCode, placementType, visible, wtop) {
                KAANGO.log('KAANGO.ca.edit.linerCatSelector');
                KAANGO.zip_code = zipCode;
                KAANGO.seller_status = placementType;
				$('#zip_code').val(zipCode);

				if (visible)
				{
					$('#category_selector_outer').stop().scrollTo('#category_selector_' + end, 800, {axis:'x'});

					$('#ad_detail_types').append($.create('div', {'class' : 'button-outer-wrapper button-display-line', 'id' : 'lockinbutton-lineredit'})
                                                                                  .append($.create('div', {'class' : 'button-inner-wrapper'})
                                                                                                   .append($.create('span', {'class' : 'primary-blue-button', 'id' : 'lockinbutton-liner'})
                                                                                                                        .append($.create('input', {'type' : 'button', 'value' : "I'm Done Selecting My Category"})))));
					
					$('#category_wrapper').before($.create('h3', {}, 'Select A Category to Get Started'));
					$('#category_wrapper').before($.create('h4', {}, ['You print category is', $('#category_selector * select:last').selectedTexts()[0], 'please select the online category for your ad.'].join(' ')));
					$('#category_wrapper').before($.create('div', {'id': 'category-choose-error', 'class': 'error'}));
				}
				else
				{
					$('#category_building').hide('blind', 'slow', function() {
						$('#category_wrapper').show('blind', 'slow', function () {
							$('#lockinbutton-lineredit').show('blind');

							/* Does Not Scroll Until The Category Selector Boxes Are Visible */
							$('#category_selector_outer').stop().scrollTo('#category_selector_' + end, 800, {axis:'x'});
						});
					});
				}

				$('#lockinbutton-liner').bind('click',function() {
                    if ($('#step_1_form').valid())
                    {
                        $('#lockinbutton-liner').unbind();

                        $("#category_selector > div > select[id^='category_selector_']:last").each ( function (index) {
                                KAANGO.ca.edit.updateAd({'zip_code' : $('#zip_code').val(),
                                                         'seller_status' : placementType,
                                                         'category_id' : $(this).val()});
        
                                KAANGO.util.ajax('getadnatures', {success: function(json){
                                        $('#adnatures_form').show();

                                        KAANGO.util.ajax('getcategoryname', {success: function(json){
                                                //KAANGO.ca.adTypeSection.createSection(adType, json.join(' > '), zipCode, placementType);
                                                // (categoryName, zipCode, sellerStatus)
                                                KAANGO.ca.getStartedSection.createSection(json.join(' > '), zipCode, placementType);
                                                // KAANGO.ca.edit.adTypeSection(adType, zipCode, placementType);
                                                // KAANGO.ca.edit.getStartedSection(zipCode, placementType);
                                        }});

                                        KAANGO.ca.edit.buildAdNatures(json.input_fields, false);

                                        KAANGO.ca.edit.baseValues();

                                        KAANGO.ca.edit.getImages();

                                        if (wtop)
                                        {
                                            KAANGO.ca.checkWTPEnabled(); 
                                        }

                                        delete KAANGO.categories;
                                }});
                        });
                    }
				});
			},

			updateAd: function (options)
			{
                KAANGO.log('KAANGO.ca.edit.updateAd');
				var a_data = {};

				a_data.zip_code = options.zip_code || KAANGO.zip_code;
				//a_data.ad_type = options.ad_type || KAANGO.ad_type;
				a_data.seller_status = options.seller_status || KAANGO.seller_status;

				if (typeof options.category_id != 'undefined')
				{
					a_data.category_id = options.category_id;
				}

				KAANGO.util.ajax('savedefaultdata',{data: a_data,
					success: function(json){
						CostingBox.buildFromOrder(json);
					}
				});
			}
		},

		removeWTP: function() {
            KAANGO.log('KAANGO.ca.edit.removeWTP');
			KAANGO.wtop.enabled = false; // Make sure this is set to false
			$('#step_2').remove();
			$('#step_3_bar .kng-step-bar-numeral').text(2);
            $('#step_3_bar').show();

			$('#w2p_ad_preview').hide('blind', {}, 1000, function() {
				$('#w2p_ad_preview').remove();
			});
		},

		// This Function Gets Called After Step 1 To See If Web To Print is Enabled
		// Already Knows that Web To Print Is Enabled for the Company
		checkWTPEnabled: function() {
            KAANGO.log('KAANGO.ca.edit.checkWTPEnabled');
			retval = true;
			KAANGO.util.ajax('checkwtp',{"data": {},
				"success": function(j){
					if (j.haswebtoprint === false)
					{
						retval = false;
						KAANGO.ca.removeWTP();
					}
					else
					{
						retval = true;
                        $('#step_2_bar').show();
                        $('#step_3_bar').show();

						/*
						 * Adds the Based Variables to Kaango For the Web To Print Step
						 */
						KAANGO.wtop.packagelist = {};
						KAANGO.wtop.category = '';
						KAANGO.wtop.forip = {runDays : [], selectedDay : ''};
						KAANGO.wtop.packId = 0;
						KAANGO.wtop.pubId = 0;
						KAANGO.wtop.zones = {};
						KAANGO.wtop.always = {};
						KAANGO.wtop.save = {};
                        KAANGO.wtop.forcePrint = j.forceprint;

                        if (j.forceprint)
                        {
                            $('#skip_cancel_w2p').remove();
                        }

						if(!JUI.datepicker()) JUI.datepicker();

						KAANGO.util.loadScript('webtoprint.js', 'webtoprint');

						// Webtoprint button setup.
						$('.w2pNext').bind('click', function()
						{
						
							KAANGO.sl.webtoprint = true;
							$.ajax.kaango.enqueue(this,arguments,function() {
                                
								if ($('#w2p_form').valid())
								{

									var parent = $(this).parents('.w2pStep'), stepCompleted = $(parent).attr('id');

									if (typeof KAANGO.wtop[stepCompleted + 'Complete'] == 'function')
									{
										if (KAANGO.wtop[stepCompleted + 'Complete']() == "INVALID") {
											return;
										}
									}

									$(parent).next().addClass('w2pStep').removeClass('w2pStep_inactive');

                                    if(!$(this).is('#w2pComplete')) {
                                        $(this).hide();
                                    }

									$('#wtopadtext').vAlign();
									$('#wtopadwrapper').vAlign();
								} else {
									var stepCompleted = $(this).parents(".w2pStep").attr('id');
									if(stepCompleted == 'w2pPackagesPublications')
										$("#wtoppackpub_error").css({"top":"-130px","left":"250px"});
								}
							});
						});

						//$('.w2pSkip').bind('click', function()
						$('#skip_cancel_w2p').bind('click', function()
						{
							KAANGO.ca.checkCancelWTOP(function() {KAANGO.ca.address.setStep(3);});
						});

						if (j.discount != null)
						{
							$('#w2p-sandbox-discount').html($.create('div', {'class' : 'kng-info-box kng-box-highlight', 'id' : 'w2p-discount-desc'}).html(j.discount));
						}
					}
				}
			});

			return retval;
		},
		
		checkCancelWTOP: function(callback,cancel) {
            KAANGO.log('KAANGO.ca.edit.checkCancelWTOP');
			if (KAANGO.wtop.started === true)
			{
				KAANGO.ca.dialog.setDefaults();
				$('#modal_dialog').html('<p>Are you sure, you would like to cancel your print ad?</p>')
					.dialog({
						title: 'Cancel My Print Ad',
						close: KAANGO.ca.dialog.destroy,
						buttons: {
							'Yes, Cancel My Print Ad': function() {
								KAANGO.ca.dialog.destroy.call(this);
								KAANGO.sl.webtoprint = false;
								KAANGO.wtop.started = false;
								callback();
							},
							'No': function() {
								KAANGO.ca.dialog.destroy.call(this);
								if (typeof cancel == 'function')
								{
									cancel();
								}
							}
						}
					});
			}
			else
			{
				KAANGO.sl.webtoprint = false;
				callback();
			}
		},

		cancelWTOP: function(){
            KAANGO.log('KAANGO.ca.edit.cancelWTOP');
			KAANGO.util.ajax('wtpdelete', {success: function(json) {CostingBox.buildFromOrder(json);}});
			KAANGO.wtop.edit = {};
			KAANGO.wtop.categorySelector(GLOBAL.w2pCategory,GLOBAL.w2pCategoryId);
			KAANGO.wtop.save = {};
			KAANGO.wtop.always = {};
			KAANGO.wtop.zones = {};
			KAANGO.wtop.pubId = 0;
			KAANGO.wtop.packId = 0;
			KAANGO.wtop.forip = {runDays : [], selectedDay : ''};
			KAANGO.wtop.category = '';
			KAANGO.wtop.packagelist = {};
			var w2pdates = $("#w2pRundates").find("#wtoprundates");
			w2pdates.find("#wtopdateselectedprefix").remove();
			w2pdates.find("#wtopenddateselectedprefix").remove();
			w2pdates.find("#wtoprundaysselectedprefix").remove();
			$(".w2pStep").not(":first").removeClass("w2pStep").addClass("w2pStep_inactive");
			$("#webtoprintpackagespublications").empty();
			$("#w2pPackageSelected").show();
			w2pdates.find("#w2pDateEdit").remove();
			w2pdates.find("#wtoprundatescal").find(".ui-state-active").removeClass("ui-state-active");
			w2pdates.find("#wtoprundatescal").find(".w2p-pubDay").removeClass("w2p-pubDay");
			GLOBAL.w2pDefaultDate = '';
			$("#w2pRundatesSelected").show();
			
			if (typeof SWFUpload_wtop != 'undefined')
			{
				SWFUpload_wtop.destroy();
			}
			
			var w2ptext = $("#w2pCreateAd");
			w2ptext.find("#wtopadcreation").empty();
			w2ptext.find("#wtopadpreview").find("#wtopadlinesminmax").empty();
			w2ptext.find("#wtopadpreview").find("#wtopad_wrapper").remove();
			
			w2ptext.hide();
			
			//$('#skipPrint > :button').val('Skip This Step');
			$('#skip_cancel_w2p').text('Skip This Step');

			$('#webtoprintcategories').empty();
			$('#w2pCategorySelected').show();
			$('#w2pComponent * .primary-blue-button').show();
			KAANGO.wtop.getW2pCategories();
			KAANGO.sl.webtoprint = false;
		},

		setExpirationDate: function() {
			KAANGO.util.ajax('daysexpiration', {data: {},
				success: function(json) {
					var maxDate, endDate, maxDateParts, endDateParts, hideCalendar = false;
					try
                    {
						maxDateParts = json.calendar.start.split('-');
                        endDateParts = json.expires.split('-');
						maxDate = new Date(maxDateParts[0], maxDateParts[1]-1, maxDateParts[2]);
						endDate = new Date(endDateParts[0], endDateParts[1]-1, endDateParts[2]);
						if(maxDate < endDate)
						{
							hideCalendar = true;
						}
                    } catch(e)
                    {
						hideCalendar = true;
                    }
					
					if($('#upsell_expdate:visible').length > 0) // if label exists, substitute by "You ad will run for x more days and it will expires y".
					{
						$('#upsell_dd_4').children().show();
						$('#upsell_dd_4 #upsell_4').show().removeAttr('disabled');
						for (var i=0; i<KAANGO.upsells.length; i++)
						{
						    if (this[i] == 4)
						    {
						    	$('#upsell_dd_4 #upsell_4').removeAttr('checked');
						    }
						}
						if($('#extra_running_days').length)
						{
							$('#extra_running_days').hide();
						}
						$('#upsell_freedays').text(json.freeDays + ' day');
						$('#upsell_expdate').text(json.expires);
					}
					else
					{
						if(hideCalendar)
						{
							$('#upsell_dd_4').children().hide();
                            $('#upsell_dd_4 span.upsell-item-cost').hide();
							if($('#extra_running_days').length) 
	                        {
	                            $('#extra_running_days').show();
	                        }
	                        else
	                        {
	                            $('#upsell_dd_4 #upsell_4').after($.create('label',{'id':'extra_running_days','class':'upsell-item-description'}));
	                            $('#extra_running_days').html('Your ad will run for <strong>'+json.freeDays+' days</strong> more and it will expire on <strong>'+json.expires+'</strong>');
	                        }
							$('#upsell_dd_4 #upsell_4').show().attr('checked','checked').attr('disabled','disabled');
						} else {
							if($('#upsell_4').is(':checked'))
							{
					            $('#upsell_4').removeAttr('checked');
								$('#extension').removeAttr('value');
                                $('#datePickerInput').text('');
                                Upsells.remove(Upsells.items.adhoc_ext_days);
							}
							
							$('#upsell_dd_4').children().show();
                            $('#upsell_dd_4 span.upsell-item-cost').show();
							if($('#extra_running_days').length) 
                            {

                                $('#extra_running_days').hide();
                            }
						}

					}
				}
			});
		},

		showUpsellPreview: function (img,title,id) {

			$.create('div',{'id':'upsellPreview_modal_dialog'},$.create('img',{'src':img}))
			  .dialog({
					title: 'Preview: '+title,
					close: KAANGO.ca.dialog.destroy.call(this),
					buttons: {
						'OK': KAANGO.ca.dialog.destroy.call(this)
					},
					modal: true,
					bgiframe: true,
					width: 'auto',
					autoOpen: true
				});
		},

		/**
		 * Gets the Pricing Details for a Sub Categories - From a Top Level Category
		 *
		 * @param int
		 *			cid The Category Id Clicked On
		 *
		 */
		catPricing: function(cid) {
			// Only Get the Data If Not Already Retrieved Once
			if ($.inArray(cid, KAANGO.pricing['r']) === -1)
			{
				// Call the Ajax To Build Out the Pricing Information
				KAANGO.util.ajax('getcategorypricing',
					{data: {categoryId : cid},
					success: function(j){
						// Add the Top Level Category Id to the Array, So It Will
						// Not Be Retrieved Anymore
						KAANGO.pricing['r'].push(cid);

						// Bind the Pricing Retrieved Out to the JSON Object
						$.each(j, function(i, val) {
							KAANGO.pricing['p'][i] = val;
						});}
					}
				);
			}
		},

		buildRequiredFields: function (required_fields) {
			if (typeof required_fields == 'object')
			{
				$('#required_fields').append($.create('div').html('<b>To Complete We Require The Following Information:</b>'));

				for (var key in required_fields)
				{
					switch(required_fields[key]) {
						case 'phone':
							$('#required_fields').append($.create('div', {'id' : 'phone_inputs'}, 'Phone Number :'));
							KAANGO.html.form_creation.input_text('phone_inputs', 'phone_1', 'phone_1', '', 4, 3);
							KAANGO.html.form_creation.input_text('phone_inputs', 'phone_2', 'phone_2', '', 4, 3);
							KAANGO.html.form_creation.input_text('phone_inputs', 'phone_3', 'phone_3', '', 5, 4);
							break;
						case 'zipCode':
							$('#required_fields').append($.create('div', {'id' : 'zip_code_input'}, 'Postal Code :'));
							KAANGO.html.form_creation.input_text('zip_code_input', 'zip_code', 'zip_code', '', 25, 25);
							break;
						case 'firstName':
							$('#required_fields').append($.create('div', {'id' : 'first_name_input'}, 'First Name :'));
							KAANGO.html.form_creation.input_text('first_name_input', 'first_name', 'first_name', '', 25, 128);
							break;
						case 'lastName':
							$('#required_fields').append($.create('div', {'id' : 'last_name_input'}, 'Last Name :'));
							KAANGO.html.form_creation.input_text('last_name_input', 'last_name', 'last_name', '', 25, 128);
							break;
						case 'address':
							$('#required_fields').append($.create('div', {'id' : 'address_input'}, 'Address :'));
							KAANGO.html.form_creation.input_text('address_input', 'address', 'address', '', 25, 128);
							break;
						case 'city':
							$('#required_fields').append($.create('div', {'id' : 'city_input'}, 'City :'));
							KAANGO.html.form_creation.input_text('city_input', 'city', 'city', '', 25, 128);
							break;
					};
				}
			}
		},

		saveRequiredFields: function() {
			submit = {};

			$('#required_fields * :input').each(function() {
  				submit[$(this).attr('id')] = $(this).val();
  			});

			KAANGO.util.ajax('saveuserdata', {data: submit});
		},

		checkRequiredFields: function() {
			error = false;

			$('#required_fields * :input').each(function() {
				if ($(this).val() == '')
				{
					error = true;
				}
  			});

			return error;
		},

		prepaidCheckout: function(required_fields) {
			KAANGO.ca.dialog.setDefaults();
			$('#modal_dialog').html(['<div id="required_fields_error"></div>',
									 '<p>You may post this ad at no charge using your credits.</p>',
									 '<div id="required_fields"></div>',
									 '<p>I agree to the terms and conditions of the ',
									 '<a href="/help/view?topic=12#anchor_4" target="_blank">Member Agreement</a>.</p>'].join(''))
			.dialog({
				title: 'Insert Ad: Member Agreement',
				close: KAANGO.ca.dialog.destroy,
				buttons: {
					'Decline': KAANGO.ca.dialog.destroy,
					'Accept': function() {

                        // disable dialog buttons for hyper click-e-age
                        $('#modal_dialog').dialog('widget').closest('.ui-dialog').find('.ui-button').button('disable');

			  			if($('#required_fields:empty').children().length == 0)
			  			{
			  				window.onbeforeunload = null;
							document.location = '/ads/create/processfreead?id=' + KAANGO.adcart;
			  			}
			  			else
			  			{
				  			if (KAANGO.ca.checkRequiredFields() === false)
				  			{
				  				// Submit the Data And Move On
				  				KAANGO.ca.saveRequiredFields();

				  				window.onbeforeunload = null;
								document.location = '/ads/create/processfreead?id=' + KAANGO.adcart;
				  			}
				  			else
				  			{
				  				// Display a Error Message to the User
				  				$('#required_fields_error').append($.create('span', {'class': 'login_error_text'}, 'Please Fill In All Fields'));
					  			return false;
				  			}
			  			}
					}
				}
			}).dialog('open');

			this.buildRequiredFields(required_fields);
		},

		freeCheckout: function() {
            KAANGO.ca.dialog.setDefaults();
            $('#modal_dialog').html('<p>You may post this ad at no charge.</p><p>I agree to the terms and conditions of the <a href="/help/view?topic=12#anchor_4" target="_blank">Member Agreement</a>.</p>')
              .dialog({
                    title: 'Insert Ad: Member Agreement',
                    buttons: {
                        'Decline': KAANGO.ca.dialog.destroy,
                        'Accept': function() {
                            // disable dialog buttons for hyper click-e-age
                            $('#modal_dialog').dialog('widget').closest('.ui-dialog').find('.ui-button').button('disable');
                            window.onbeforeunload = null;
                            document.location = '/ads/create/processfreead?id=' + KAANGO.adcart;
                        }
                    },
                    close: KAANGO.ca.dialog.destroy
                }).dialog('open');
		},

        expiredAd : function(adid)
        {
            KAANGO.ca.dialog.setDefaults();

            $('#modal_dialog').empty().html('<p>Sorry The Ad You Are Editing Has Expired.</p><p><a href="/ads/create?aid=' + adid + '&clone=1">You may clone the ad.</a></p>')
				  .dialog({
						title: 'Expired Ad',
						buttons: {
							'Clone': function() {
								window.onbeforeunload = null;
								document.location = '/ads/create?aid=' + adid + '&clone=1';
							}
						},
						close: KAANGO.ca.dialog.destroy
					}).dialog('open');
        },

		/**
		 * send our guest to secured chekout
		 */
		checkout: function(reqDest) 
		{
			window.onbeforeunload = null;
			var sDestination = reqDest +'/ads/create/checkout?id='+KAANGO.adcart+'&m=1';
			document.location = sDestination;
		},

		updateOnlinePreview: function() {
			$('.onlineAdPreview').unbind().bind('click',showPreview).css('cursor', 'pointer');
                        $('#onlineAdPreview_img').attr('src','/resources/img/online_ad_default.gif?t=');
                        $('.onlineAdPreview').show();

			function showPreview() {
				KAANGO.ca.analytics('placeAdOnlinePreview');
				
				KAANGO.ca.dialog.setDefaults();
	
				$('#modal_dialog').html('<iframe src="/ads/create/onlinepreview?adCartId=' + KAANGO.adcart + '" frameborder="0" width="100%" height="100%"></iframe>')
					.dialog({
						width: 700,
						height: 500,
						title: 'Online Ad',
						close: KAANGO.ca.dialog.destroy,
						buttons:{
							'OK': KAANGO.ca.dialog.destroy
						}
					});
			}
		},

		initOnlineAdTinyMCE: function() {
			var count = 0;
			function initTinyMCE()
			{
				count++;
				if ($('.adnature_wysiwyg:visible').length)
				{
					clearInterval(interval);
					
					$('.adnature_wysiwyg:visible').tinymce({
                        
                         // Location of TinyMCE script
                        script_url : '/resources/js/jquery/tinymce/tiny_mce.js',
                        themes : 'advanced',
                        languages : 'en',
                        paste_remove_styles:true,
                        paste_remove_spans:true,
                        debug : false,
						// General Options
						entity_encoding : "raw",
						mode: "textareas",
						theme: "advanced",
						theme_advanced_buttons1 :
							"fontsizeselect,bold,italic,underline,strikethrough,separator,justifyleft,justifycenter,justifyright,justifyfull",
						theme_advanced_buttons2 :
							"forecolor,separator,bullist,numlist,removeformat,separator,undo,redo",
                        theme_advanced_buttons3 : "",
						theme_advanced_toolbar_location : "bottom",
						theme_advanced_toolbar_align : "center",
						plugins: 'safari,tabfocus, paste',
						cleanup: true,
						verify_html : true,
			            cleanup_serializer : 'xml',
						valid_elements: 'a[href],strong/b,em/i,p[style],ol,ul,li,span[style],script',
						save_callback: "KAANGO.ca.tinyMceRemoveComments",
						editor_selector : 'adnature_wysiwyg',
						content_css : '/resources/css/tinymce_custom.css',
						init_instance_callback:function(editor){
    					    function keyUp() {
    					        $("#" + editor.id).valid();
    					        // don't trigger this event on every key
    	                        editor.onKeyUp.remove(keyUp);
    	                    }
    					    editor.onKeyUp.add(keyUp);
    					    
							editor.onChange.add(function(ed, l)
							{
							    var valid = $("#" + ed.id).valid();
							    if(valid) {
							        KAANGO.ca.saveField(ed.id, ed.getContent(), 1);
							    } else {
							        // validate again on first key pressed
							        editor.onKeyUp.add(keyUp);
							    }
							});
						}
					});
				}
				if (count > 4)
				{
					clearInterval(interval);
				}
			}
			var interval = setInterval(initTinyMCE,500);
		},

		addressInit: function(event) {
            KAANGO.log('KAANGO.ca.addressInit');
			KAANGO.address.anchor = 'ca';
			$.address.change(function(event) {
				var hashPath = '',
					query = {},
					length = 0,
					loc = window.location,
					redirect = false,
					redirectQuery = '',
					hashQuery = '',
					splitLoc = {},
					splitPair = {};
				
				(function (hash) {
					var url = hash.split("?"),
						values = typeof url[1] != 'undefined' ? url[1].split("&") : [];

					if (url[0].indexOf('/') != -1)
					{
						hashPath = url[0].split('/');
						hashPath[0] = '';
						hashPath = hashPath.join('/');
					}
					length = values.length;
					for( var key in values)
					{
						var value = values[key].split("=");
						if (value.length == 2)
						{
							query[value[0]] = value[1];
						}
					}
				})(event.value)
				
				if(hashPath=='')
				{
					if(KAANGO.address.lastVisited==1 && typeof KAANGO.ca.beforeLeavePage == 'function')
					{
						KAANGO.ca.beforeLeavePage();
					}
				} else {
                    KAANGO.log('hash changing step');
					var steps = hashPath.split('/');
                    
                    var currentTitle = document.title,
                        titlePieces = currentTitle.split('-'),
                        title = 'Create ad - ' + jQuery.trim(titlePieces[titlePieces.length-1]);
                    
					if(steps.length>=2)
					{
						steps.shift();
					}

					step = steps[0];

					var lastVisited = parseInt(KAANGO.address.lastVisited.replace(/[^0-9]/,''));
					lastVisited = isNaN(lastVisited) ? 0 : lastVisited;

					if (true)//KAANGO.address.lastVisited != '/' || step == 1 || lastVisited+1 == step || $('#step_'+step+'_bar').hasClass('step_bar_visited'))
					{
						if(step==1)
						{
							document.title = 'Write your ad - ' + title;
						}
						else if(step==2)
						{
							$.ajax.kaango.queue = [];
							document.title = 'Put Your Ad in the Paper - ' + title;
						}
						else if(step==3)
						{
							document.title = 'Make Your Online Ad Stand Out - ' + title;
						}

						if((step!=1 && KAANGO.address.lastVisited!='/') || step>1)
						{
							KAANGO.transition(step);
						}
						else if(step==1 && KAANGO.address.lastVisited > 1)
						{
							KAANGO.transition(step);
						}
					}

					if (KAANGO.address.lastVisited != step)
					{
						KAANGO.address.lastVisited = step;
					}
				}
				
				var hash = '';
				if (loc.search.length)
				{
					var locSearchArray = loc.search.substring(1).split('&');
					for (var key in locSearchArray)
					{
						splitPair = locSearchArray[key].split('=');
						if (splitPair.length == 2)
						{
							splitLoc[splitPair[0]] = splitPair[1];
						}
					}
				}
				for (var key in query)
				{
					switch (key)
					{
						case 'id':
							if (KAANGO.adcart === null)
							{
								splitLoc[key] = query[key];
								delete query[key];
								redirect = true;
							}
							break;
					}
				}
				if (redirect)
				{
					hashQuery = $.param(query);
					hash = hashPath + (hashQuery.length ? '?'+hashQuery: '');
					window.location.replace(loc.protocol+'//'+loc.host+loc.pathname+'?'+$.param(splitLoc)+(hash.length ? '#'+KAANGO.address.anchor+hash : ''));
				}
			});
			$.address.strict(false);
		},

		displayAdSaved: function() {
			KAANGO.ca.dialog.setDefaults();
			$('#modal_dialog').html("<p>Your ad has been saved. You may view your ad in the <a onClick='window.onbeforeunload = null' href='/account/' class='link'>My Account section</a></p>")
			  .dialog({
					title: 'Success',
					close: KAANGO.ca.dialog.destroy,
					buttons:{
						'OK': function() {
							KAANGO.ca.dialog.destroy.call(this);
							window.onbeforeunload = null;

						}
					}
				});
		},

		beforeLeavePage: function (){
			KAANGO.ca.dialog.setDefaults();
			$('#modal_dialog').html("<p>You have not saved your ad. Please login and save your ad before leave.</p>")
			  .dialog({
					title: 'Do you want to leave?',
					close: function (evt) {
						KAANGO.ca.dialog.destroy.call(this);
						KAANGO.ca.address.setStep(1); // history is set to / again to repeat message if user try to leave without save ad
					},
					buttons:{
						'Yes, discard my ad.': function() {
							KAANGO.ca.dialog.destroy.call(this);
							window.onbeforeunload = null;
							history.go(-1);
						},
						'No. I want to save my ad.': function() {
							KAANGO.ca.dialog.destroy.call(this);
                            KAANGO.ca.displayAdSaved();
						}
					}
				});
		},

		notAllowedToEdit: function()
		{
			JUI.dialog();
			KAANGO.ca.dialog.setDefaults();
			
			$('#modal_dialog').html('<p>Sorry, But You Do Not Have Access to Edit This Ad.</p>')
				  .dialog({
						title: 'You Do Not Have Access to This Ad',
						closeOnEscape: false,
						open:function() { // Removes the X Close Button, Currently No Option For This As Of v1.7.1
							$(this).parents(".ui-dialog:first").find(".ui-dialog-titlebar-close").remove();
				  		},
						buttons:{
							'OK': function() {
								window.onbeforeunload = null;
								window.location = '/ads/create';
							}
						}
					});
		},
		
		step3: {
			buildUpsells: function(upsells, days) {
				var show_ext_upsell = false; // Determines If the Extension Date Calendar Is Created

				/*
				 * If the Calender End and Start Date are Both Null
				 * - Means There are NO Extension Days Available -
				 */
				if (days['calendar']['end'] !== null && days['calendar']['start'] !==null)
				{
					var minSplit = days['calendar']['start'].split('-'),
						minDate = new Date(minSplit[0], parseInt(minSplit[1], 10) - 1, minSplit[2]),
						maxSplit = days['calendar']['end'].split('-'),
						maxDate = new Date(maxSplit[0], parseInt(maxSplit[1], 10) - 1, maxSplit[2]);
					
					if (minDate <= maxDate)			// If at least one day remaining
					{
						show_ext_upsell = true;		// Show the datepicker
					}

					delete minSplit;
					delete maxSplit;
				}

				for (var upsellId in upsells)
				{
					$('#upsell_'+upsells[upsellId].itemId).remove();

					if (upsells[upsellId].itemId == Upsells.items.adhoc_ext_days)
					{
						if (show_ext_upsell)
						{
							upsells[upsellId]['itemDescription'] = upsells[upsellId]['itemDescription'].replace('{{{current_rundays}}}', days['freeDays']);
							upsells[upsellId]['itemDescription'] = upsells[upsellId]['itemDescription'].replace('{{{expiration_date}}}', days['expires']);

							JUI.datepicker();

							this.createUpsell(upsells[upsellId]);

							// Load In the Date Picker
							$('#extension').datepicker({
								minDate: minDate,
								maxDate: maxDate,
								numberOfMonths:2,
								dateFormat: 'yy-mm-dd',
								showOn: 'both',
								buttonImage: '/resources/img/calendar.gif',
								buttonImageOnly: true,
								onSelect: function(dater, e) {
                                    var dateParts = $.trim(dater).split('-'),
                                        date = new Date(dateParts[0], parseInt(dateParts[1],10) - 1, dateParts[2]);

                                    try
                                    {
                                        Upsells.add({'id' : Upsells.items.adhoc_ext_days, 'quantity' : dateFormat(date, dateFormat.masks.isoDate)});
                                        $("#upsell_"+Upsells.items.adhoc_ext_days).attr("checked","checked");
                                        $('#datePickerInput').text(dateFormat(date, $('#jsDayMonthFormat').text()));
                                    }
                                    catch(e)
                                    {
                                        // for safety so the script does not stop running
                                        // alert(e);
                                    }
								}
							});
						}
					}
					else
					{
						this.createUpsell(upsells[upsellId]);
					}
				}
			},

			createUpsell: function(upsell)
			{
				upsell.price_extra = (upsell.itemId == Upsells.items.adhoc_ext_days ? 'per day ' : '');

				KAANGO.html.form_creation.upsellCheckbox(upsell)
					.bind('click',function() {
						if($(this).val() == Upsells.items.adhoc_ext_days)
						{
							if($(this).is(':checked'))
							{
								$('#extension').datepicker('show');
								Upsells.determine($(this).val(), $(this).is(':checked'));
							} else {
								$('#extension').removeAttr('value');
								$('#datePickerInput').text('');
								Upsells.remove(Upsells.items.adhoc_ext_days);
                            }
						}
						else
						{
							Upsells.determine($(this).val(), $(this).is(':checked'));
						}
					});

				if (upsell.linktext !== null)
				{
					$('label[for="upsell_'+upsell.itemId+'"]').parent()
						.append('&nbsp;&nbsp;')
						.append(
							$.create('a',{'id':'upsell_'+upsell.itemId+'_preview','role':'link','class':'link'},'show me')
								.bind('click',function() {
									KAANGO.ca.showUpsellPreview(upsell.linktext,upsell.itemDescription,'upsell_'+upsell.itemId+'_preview');
									return false;
								})
						);
				}

				if (upsell.itemId == Upsells.items.adhoc_ext_days)
				{
					$('#upsell_dd_'+upsell.itemId+' .upsell-item-cost')
						.after($.create('input',{'id':'extension'}));
					$('#extension').attr('readonly','readonly');
					$('#extension').after($.create('span',{'id':'datePickerInput','class':'datePickerInput'}));
				}

				$('#datePickerInput')
					.bind('click',function(){
						$('#upsell_4').attr('checked','checked');
						$('#extension').datepicker('show');
					});
			},
			upsellCalendar: function(e){
				if($(e).val() == Upsells.items.adhoc_ext_days)
				{
					$('#extension').datepicker('hide');

					if ($(e).is(':checked'))
					{
						$('#extension').datepicker('show');
					}
					else
					{
						$('#extension').removeAttr('value');
						$('#datePickerInput').text('');
						Upsells.remove(Upsells.items.adhoc_ext_days);
					}
				}
				else
				{
					Upsells.determine($(e).val(), $(e).is(':checked'));
				}
			},
			submitCoupon: function(id)
			{
				$('#'+id+'_btn').hide();
				var couponCode = $('#'+id+'_txt').val();
				KAANGO.util.ajax('submitcoupon',{data: {'couponcode':couponCode,'bundle':$('#'+id+'_hdn').val()},
					success: function(json){
						if (typeof json['costs'] != 'undefined')
						{
							CostingBox.buildFromOrder(json['costs']);
						}
						if (typeof json['bundles'] != 'undefined' && json['bundles'].length)
						{
							if ($('#'+id+'_hdn').val())
							{
								$('#'+id+'_txt').hide();
								$('#'+id).hide();
							}
							else
							{
								$('#'+id+'_txt').val('');
								$('#'+id+'_btn').show();
							}
							$('#'+id+'_txt').rules('remove','invalid');
							KAANGO.ca.step3.buildBundles(json['bundles'],true,couponCode);
							
							$('#'+id+'_btn').parents('#coupon_code').hide();

							$('#coupon_code').hide();
						}
						else
						{
							function checkEmpty() {
								$('#'+id+'_txt').rules('remove','invalid');
								$('#bundles_upsells_form').valid();
							}
							// oncut only exists in IE and more modern browsers, but it shouldn't cause any errors for older browsers
							$('#'+id+'_txt').one('keyup', checkEmpty).one('cut', function() {setTimeout(checkEmpty,1)})
								.rules('add',{invalid: true, messages: {invalid: 'Sorry, that Coupon Code is no longer valid'}});
							$('#'+id+'_btn').show()
								.one('click', function() {
									KAANGO.ca.step3.submitCoupon(id);
								});
						}
						$('#bundles_upsells_form').valid();
					},
					error: function(){
						$('#'+id+'_btn').show()
								.one('click', function() {
									KAANGO.ca.step3.submitCoupon(id);
								});
					}
				});
			},

			buildCoupon: function(id,bundleId)
			{
				if(bundleId == undefined) {
					// label description not returned by json file.
					var couponLabel = "Input your coupon code to view package details.";
					$.create('span',{'id':id+'_lbl'},couponLabel).appendTo('#'+id);
				}

				KAANGO.html.form_creation.input_text(id, id+'_txt', id+'_txt', null, 15, 64);
				KAANGO.html.form_creation.button(id, id+'_btn', id+'_btn', 'Add Coupon');
				
				$('#'+id+'_btn').one('click', function() {
					KAANGO.ca.step3.submitCoupon(id);
				});

				$.create('input',{'id':id+'_hdn','type':'hidden', 'value': bundleId}).appendTo('#'+id);
			},

			buildBundles: function(bundles,update,coupon)
			{
				for (var key in bundles)
				{
					if (update)
					{
						bundles[key].coupon = 0;
						bundles[key].couponCode = coupon;
						bundles[key].checked = 1;
						$('#bundle_'+bundles[key].id).remove();
						$('#bundle_dt_'+bundles[key].id).remove();
						$('#bundle_dd_'+bundles[key].id).remove();
					}
					KAANGO.ca.step3.createBundle(bundles[key]);
					if (update)
					{
						KAANGO.ca.step3.clickBundle.apply($('#bundle_'+bundles[key].id)[0],[true]);
					}
				}
			},
			// refresh Bundle
			refreshBundle: function(bundle)
			{
				
				KAANGO.ca.tryAjax('getbundlesupsells',{data: {},
					success: function(json){
						$('#bundles #bundleList').empty();
						if (json['bundles'] != '')
						{
							KAANGO.ca.step3.buildBundles(json['bundles']); // show
						}
						
                                                if(json['coupons'] == 2)
						{
							$('#coupon_code').show()
							$('#coupon_code_btn').one('click', function() {
									KAANGO.ca.step3.submitCoupon('coupon_code');
							}); // hidden
						}
					}
				});
			},
			// Build Out new Bundle
			createBundle: function(bundle)
			{
				if ($('#bundle_dt_'+bundle.id).length === 0)
				{
					var checkbox = $.create('input',{name: 'upsell', type: 'checkbox', id:'bundle_' + bundle.id, value:bundle.id, 'class': 'bundleCheckbox'})
						.click(function() {
							KAANGO.ca.step3.clickBundle.apply(checkbox,[false]);
							if(!$(this).prop('checked')) {
								KAANGO.ca.step3.refreshBundle(bundle);
							}
						});
					$('#bundleList').append($.create('dt', {id : 'bundle_dt_' + bundle.id}));
					$('#bundle_dt_' + bundle.id)
						.append(checkbox)
						.append($.create('label', {'class': 'bundleMainLabel'}).html(bundle.desc))
						.append($.create('span',{'class' : 'bundle-item-cost'}).html(KAANGO.util.monetize(bundle.price)));
					$('#bundleList').append($.create('dd', {id : 'bundle_dd_' + bundle.id}));
					$('#bundle_dd_' + bundle.id).append($.create('ul', {id: 'bundle_items_'  + bundle.id}));
					
					if (bundle.checked == 1)
					{
						$('#bundle_' + bundle.id).attr('checked', 'checked');
						KAANGO.current_bundle = 'bundle_' + bundle.id;

						KAANGO.ca.setExpirationDate();
					}
					
					if (bundle.disabled == 1)
					{
						$('#bundle_' + bundle.id).attr('disabled', 'disabled');
					}

					KAANGO.bundles[bundle.id] = {};

					for (var s_key in bundle.items)
					{
						$.create('li', {'id' : 'bundle_upsell_' + bundle.items[s_key].id, 'class':'bundle_label' }).html(bundle.items[s_key].name).appendTo('#bundle_items_'  + bundle.id);
						KAANGO.bundles[bundle.id][s_key] = {'id' : bundle.items[s_key].id, 'qty' : bundle.items[s_key].qty};

						if (bundle.checked == 1)
						{
							$('#upsell_' + bundle.items[s_key].id).attr({'checked': 'checked', 'disabled' : 'disabled'});
						}
					}
					
					if (typeof bundle.couponCode != 'undefined')
					{
						$.create('input',{'id':'bundle_'+bundle.id+'_cpn','type':'hidden','value':bundle.couponCode}).insertAfter('#bundle_'+bundle.id);
					}

                                        if (bundle.coupon == 1)
					{
						$('#bundle_' + bundle.id).attr('disabled', 'disabled');
						$.create('li', {'id' : 'coupon_code_' + bundle.id, 'class':'bundle_label' }).appendTo('#bundle_items_'+bundle.id);
						KAANGO.ca.step3.buildCoupon('coupon_code_' + bundle.id,bundle.id);
					}

				}
			},

			clickBundle: function(update)
			{
				var uncheckUpsells = function(call_remove) {
					$('#upsells').find('input:checkbox:checked').each (function () {
						if (call_remove)
						{
							Upsells.remove({'id' : $(this).val(), 'update' : true}, false);
						}
						$(this).removeAttr('checked').removeAttr('disabled');
						
					});
				},
				ajax = function (id, status, has_ext) {
					KAANGO.util.ajax('addremovebundle',{data: {'bundleId': id, 'add': status, 'update' : 1, 'coupon': $('#bundle_'+id+'_cpn').val() || ''},
						success: function(json){
							if (!json.success)
							{
								$('#bundle_'+id).attr('disabled','disabled').removeAttr('checked');
								if($('#upsell_4').is(':checked'))
	                            {
                                    $('#upsell_4').removeAttr('checked');

                                    $('#upsell_dd_4 > #datePickerInput').empty();
                                    
	                                $('#extension').removeAttr('value');

	                                Upsells.remove(Upsells.items.adhoc_ext_days);
	                            }
								if ($('#coupon_code_' + id).length == 0)
								{
									$.create('li', {'id' : 'coupon_code_' + id, 'class':'bundle_label' }).appendTo('#bundle_items_'+id);
									KAANGO.ca.step3.buildCoupon('coupon_code_' + id,id);
								}
								else
								{
									$('#coupon_code_'+id).show();
									$('#coupon_code_'+id).children().show();
								}
							}
							else if (typeof json.costs != 'undefined')
							{
								
								var dateWhole = new Date();
                                
								if (json.mindate !== null)
								{
									var dateParts = json.mindate.exp_date.split('-');
									dateWhole = new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10) + 1);
								}
								$('#extension').datepicker('option', 'minDate', dateWhole);

								if($('#upsell_4').is(':checked'))
								{
									Upsells.remove(Upsells.items.adhoc_ext_days);
                                    
                                    $('#upsell_4').removeAttr('checked');

                                    $('#upsell_dd_4 > #datePickerInput').empty();
								}
                                else
                                {
                                    CostingBox.buildFromOrder(json.costs);
                                }
								
								KAANGO.ca.setExpirationDate();
							}
						}
					});
				},
				updatePhoto = function (amount) {
					KAANGO.ca.upsellBaseData({'freepix' : KAANGO.photos.free,
											  'bundlepix' : KAANGO.photos.bundle_free,
											  'additionalpix' : KAANGO.photos.cost_above,
                                              'maxPhotos': KAANGO.photos.max});
				};

				/*
				 * The User Has Unchecked the Bundle Selected - Need to Remove From the Server
				 * And then Add Back in the Original Upsells - If Any Checked By The User
				 */
				if ($(this).attr('id') == KAANGO.current_bundle && $(this).is(':checked') === false)
				{
					var i = 0, length = KAANGO.upsells.length, 
						full_id = $(this).attr('id'),
						id = parseInt(full_id.replace(/bundle_/, '')),
						bundle = KAANGO.bundles[id],
						bundle_arr = [];
					
					for (var b_key in bundle)
					{
						bundle_arr.push(parseInt(bundle[b_key].id));
					}

					delete bundle;
					delete full_id;
					delete id;
					
					// Removes the Bundle From the Server
					if (!update)
					{
						ajax($(this).val(), 0, false);
					}

					// Uncheck Any Upsells that the Bundle Had
					uncheckUpsells(false);

					if (KAANGO.photos.bundle_free > 0)
					{
						// Set the Photo Boxes Back to the Free Photos
						KAANGO.photos.bundle_free = 0;
						updatePhoto(KAANGO.photos.free);
					}

					for (var key in KAANGO.upsells)
					{
						var id = KAANGO.upsells[key];

						// Non-Interactive Ones -- Need a Better Way
						if (id != 5 && id != 6 && id != 7 && id != 10)
						{
							/*
							 * Re-Check Upsells Already Selected Before the Bundle Selection
							 */
							$('#upsell_' + id).attr('checked', 'checked');
							
							// Add The Upsell Back to the Order If Inside the Bundle
							if (jQuery.inArray(id, bundle_arr) != -1)
							{
								Upsells.add({'id' : id, 'update' : true});
							}
						}
					}

					// Reset the Variable Back to Original State
					KAANGO.current_bundle = -1;
				}
				else
				{
					$('#coupon_code').hide();
					var bundleId = $(this).val(),
						has_ext = false;

					// Uncheck All Previous Bundles
					$('#bundles').find('input[id!=bundle_' + bundleId + ']:checkbox:checked').each( function () {
						// Need To Remove the Bundle From the Server Also
						if (!update)
						{
							ajax($(this).val(), 0, false);
						}
						$(this).removeAttr('checked');
					});

					if (KAANGO.photos.bundle_free > 0)
					{
						// Set the Photo Boxes Back to the Free Photos
						KAANGO.photos.bundle_free = 0;
						updatePhoto(KAANGO.photos.free);
					}

					uncheckUpsells(true);

					/*
					 * Check The Buttons for the Each of the Upsells that Come With the Bundle
					 */
					for (var key in KAANGO.bundles[bundleId])
					{
						if (KAANGO.bundles[bundleId][key].id == 8)
						{
							// Updates the Photo Boxes to the New Free Amount Based on the Bundle
							KAANGO.photos.bundle_free = parseInt(KAANGO.bundles[bundleId][key].qty);

							updatePhoto(KAANGO.photos.bundle_free + KAANGO.photos.free);
						}
						else if (KAANGO.bundles[bundleId][key].id == 9)
						{
							has_ext = true;
						}
						else
						{
							var id = KAANGO.bundles[bundleId][key].id;
							$('#upsell_' + id).attr({'checked': 'checked', 'disabled' : 'disabled'});

							for (var key in KAANGO.upsells)
							{
								if (KAANGO.upsells[key] == i)
								{
									/*
									 * Remove It Out of the Master Array
									 * Because This Will Be Used to Rebuild the Items
									 * if the User Chooses and Unchooses a Bundle
									 */
									KAANGO.upsells.splice(key, 1);
									break;
								}
							}
						}
					}

					// Save the Bundle Out to the Server
					if (!update)
					{
						ajax(bundleId, 1, has_ext);
					}

					/*
					 * We Need to Add Back in the Upsells that Did Not Come With the Bundles,
					 * But Previously Selected
					 */
					$('#upsellList').find('input:checkbox:not(:disabled)')
						.each (function () {
							for (var key in KAANGO.upsells)
							{
								// Non-Interactive Ones -- Need a Better Way
								if ($(this).val() == KAANGO.upsells[key])
								{
									/*
									 * Re-Check Upsells Already Selected Before the Bundle Selection
									 */
									$('#upsell_' + KAANGO.upsells[key]).attr('checked', 'checked');

									/*
									 * Tell the Server Which Bundles Where Originally Selected
									 * To Add Back to the Current Order
									 */
									Upsells.add(KAANGO.upsells[key]);
								}
							}
						});

					KAANGO.current_bundle = $(this).attr('id');
				}
			}
		},

		dialog: {
			setDefaults: function() {
				KAANGO.util.ui_dialog_default();
			},

			destroy: function(dialog,id) {
				$(this).dialog("destroy");
				$('#'+id).empty();
			}
		},
		
		address: {
			setStep: function(e){
				var hashPath = (e!='/'?'/' + e + '/':'/');
				if (KAANGO.adcart)
				{
					KAANGO.address.setHashPathAndValue(hashPath,{'id':KAANGO.adcart});
				}
				else if (e=='/' || e <= 1)
				{
					KAANGO.address.setHashPath(hashPath);
				}
			}
		},

        requiredFieldsDialog: function(req_fields, fnSuccess)
        {

            if (!KAANGO.ca.dialogDefaultsSet) {
                    KAANGO.ca.dialog.setDefaults();
                KAANGO.ca.dialogDefaultsSet = true;
            }

            $('#modal_dialog').html('<p>The User Assigned To This Ad is Missing User Details Please Enter</p>'
                                  + '<div id="accountsettings_error_wrapper" style="display: none; padding: 0pt 0.7em;" class="ui-state-error ui-corner-all">'
                                  + '<p><span style="float: left; margin-right: 0.3em;" class="ui-icon ui-icon-alert"></span>'
                                  + '<span id="accountsettings_error"></span></p></div><div id="accountsettings_update" class="modal_form"></div>')
                .dialog({
                    open: function() {
                        $(this).parents(".ui-dialog:first").find(".ui-dialog-titlebar-close").remove();
                        $('#accountsettings_update').append(
                            $.create('fieldset').append(
                                    $.create('legend', {}, 'Account Details')
                            ).append(
                                    $.create('ul').append(
                                            $.create('li').append(
                                                    $.create('label', {'for' : 'account_first_name'}, 'First Name: *')
                                            ).append(
                                                    $.create('input', {'type' : 'text', 'value' : req_fields.account_info.name.first, 'id' : 'account_first_name'})
                                            )
                                    ).append(
                                            $.create('li').append(
                                                    $.create('label', {'for' : 'account_last_name'}, 'Last Name: *')
                                            ).append(
                                                    $.create('input', {'type' : 'text', 'value' : req_fields.account_info.name.last, 'id' : 'account_last_name'})
                                            )
                                    ).append(
                                            $.create('li').append(
                                                    $.create('label', {'for' : 'account_address'}, 'Address: *')
                                            ).append(
                                                    $.create('input', {'type' : 'text', 'value' : req_fields.account_info.address.address, 'id' : 'account_address'})
                                            )
                                    ).append(
                                            $.create('li').append(
                                                    $.create('label', {'for' : 'account_city'}, 'City: *')
                                            ).append(
                                                    $.create('input', {'type' : 'text', 'value' : req_fields.account_info.address.city, 'id' : 'account_city'})
                                            )
                                    ).append(
                                            $.create('li').append(
                                                    $.create('label', {'for' : 'account_postal_code'}, 'Postal Code: *')
                                            ).append(
                                                    $.create('input', {'type' : 'text', 'value' : req_fields.account_info.address.postalCode, 'id' : 'account_postal_code'})
                                            )
                                    ).append(
                                            $.create('li').append(
                                                    $.create('label', {'for' : 'account_phone_1'}, 'Phone: *')
                                            ).append(
                                                    $.create('input', {'size': 5, 'maxlength': 3, 'type' : 'text', 'value' : req_fields.account_info.phone.parts[0], 'id' : 'account_phone_1'})
                                            ).append(
                                                    $.create('input', {'size': 5, 'maxlength': 3, 'type' : 'text', 'value' : req_fields.account_info.phone.parts[1], 'id' : 'account_phone_2'})
                                            ).append(
                                                    $.create('input', {'size': 6, 'maxlength': 4, 'type' : 'text', 'value' : req_fields.account_info.phone.parts[2], 'id' : 'account_phone_3'})
                                            )
                                    )
                            )
                        );
                    },
                    title: 'User Details Needed',
                    escape: false,
                    buttons: {
                        'Save Details': function() {
                            var params = {'first_name' : $('#account_first_name').val(),
                                          'last_name' : $('#account_last_name').val(),
                                          'address' : $('#account_address').val(),
                                          'city' : $('#account_city').val(),
                                          'postal_code' : $('#account_postal_code').val(),
                                          'phone_1' : $('#account_phone_1').val(),
                                          'phone_2' : $('#account_phone_2').val(),
                                          'phone_3' : $('#account_phone_3').val()
                                         },
                                error = '';

                            if (params.first_name == '')
                            {
                                error = error + 'First Name Was Left Blank<br />';
                            }

                            if (params.last_name == '')
                            {
                                error = error + 'Last Name Was Left Blank<br />';
                            }

                            if (params.address == '')
                            {
                                error = error + 'Address Was Left Blank<br />';
                            }

                            if (params.city == '')
                            {
                                error = error + 'City Was Left Blank<br />';
                            }

                            if (params.postal_code == '')
                            {
                                error = error + 'Postal Code Was Left Blank<br />';
                            }

                            if (params.phone_1 == '' || params.phone_2 == '' || params.phone_3 == '')
                            {
                                error = error + 'Part of Phone Was Left Blank<br />';
                            }

                            if (error != '')
                            {
                                $("#accountsettings_error").html(error);
                                $("#accountsettings_error_wrapper").show();
                            }
                            else
                            {
                                KAANGO.util.ajax('saveuserdetails',{"data": params,
                                             "success":function(json) {
                                                    if (json.errors == 0)
                                                    {
                                                        KAANGO.ca.dialog.destroy.call($("#modal_dialog"));
                                                        if (typeof fnSuccess == 'function')
                                                        {
                                                            fnSuccess();
                                                        }
                                                    }
                                                    else
                                                    {
                                                        error = "Please Verify the Information Provided";
                                                        $("#accountsettings_error").html(error);
                                                        $("#accountsettings_error_wrapper").show();
                                                    }
                                                 }
                                });
                            }
                        }
                    }
                });
        }
	},

    modalWindows: {
        editCloneCategoryDisabled : function(newspaperName)
        {
            // Load Up the jQuery UI Dialog Box
            JUI.dialog(function(){
                KAANGO.util.ui_dialog_default();
                $('#modal_dialog').html('<div class="dialog">'
                    + '<p>Sorry, ' + newspaperName + ' is currently not accepting ads in this category.</p>')
                .dialog({
                    title: 'Can Not Place Ad ... ',
                    close: function() {
                        KAANGO.ca.dialog.destroy.call(this);
                        window.onbeforeunload = null;
                        window.location = "/ads/create";
                    },
                    open: function(){
                        setTimeout(function(){
                            $('.kaangoError').hide();
                        }, 10);
                    },
                    buttons:{
                        "Continue":function(){
                            KAANGO.ca.dialog.destroy.call(this);
                            window.onbeforeunload = null;
                            window.location = "/ads/create";
                        }
                    }
                });
            });
        },

        redirect: function(name, url, close, message)
        {
            // Load Up the jQuery UI Dialog Box
            JUI.dialog(function(){
                KAANGO.util.ui_dialog_default();
                $('#modal_dialog').html('<div class="dialog"><p>' + message + '</p><br /><a href="' + url + '">' + name + '</a>')
                .dialog({
                    title: 'Redirecting ... ',
                    close: close,
                    open: function(){
                        setTimeout(function(){
                            $('.kaangoError').hide();
                        }, 10);
                    },
                    buttons:{
                        "Cancel": close,
                        "Continue": function(){
                            KAANGO.ca.dialog.destroy.call(this);
                            window.onbeforeunload = null;
                            window.location = url;
                        }
                    }
                });
            });
        }
    },

	/*
	 * this == $('#step_X'), where X is the # of the current step
	 *
	 * Enter Step:
	 * init - before animation begins
	 * load - after animation has ended
	 *
	 * Leaving Step:
	 * beforeUnload - called before transition, must call "callback.apply(parent,args)" to continue with transition
	 * unload - before animation begins
	 * exit - after animation has ended
	 */
	triggers: {
		step1: {
			load: function() {
				$('#descriptio_required_global_description_input_1').show();
				$('.adnature_wysiwyg').parent().show();
			},

			unload: function() {
				$('.adnature_wysiwyg').parent().hide();
			}
		},

		step2: {
			init: function() {
				KAANGO.sl.a_webtoprint = true;
			},

			load: function() {
				if ($('#wtopphotos_wrapper:visible:not(:has(:first-child))').length)
				{
					$('#wtopphotos_wrapper').remove();
					KAANGO.wtop.photoUpload();
				}
			},

			beforeUnload: function(callback,cancel) {
				if (KAANGO.sl.webtoprint && !KAANGO.ca.wtopComplete)
				{
					KAANGO.ca.checkCancelWTOP(callback,cancel);
				}
				else
				{
					callback();
				}
			},

			unload: function() {
				if ($('#wtopphotos_wrapper object[id^="SWFUpload_"]').length)
				{
					SWFUpload_wtop.destroy();
					$('#wtopphotos_wrapper').empty();
				}
			},

			exit: function() {
				if (KAANGO.sl.webtoprint === false)
				{
					KAANGO.ca.cancelWTOP();
					$('#wtoprundatescal').hide().datepicker('destroy');
				}
			}
		},

		step3: {
			init: function() {
				if (KAANGO.sl['3'] === true)
				{
					return;
				}

                $('html').animate({scrollTop:$('#kng-create-ad-wrapper').offset().top}, 'slow');

				JUI.progressbar();

				KAANGO.sl['3'] = true;

				KAANGO.ca.tryAjax('getbundlesupsells',{data: {},
					success: function(json){
						KAANGO.ca.step3.buildUpsells(json['upsells'], json['days']);
						
						if (json['bundles'] != '')
						{
							KAANGO.ca.step3.buildBundles(json['bundles']); // show
						}
                                                
                                                if(json['coupons'] == 2)
						{
							KAANGO.ca.step3.buildCoupon('coupon_code'); // hidden
						}
					}
				});
				if(typeof KAANGO.ca.videoLinkMemory != 'undefined')		 // If video memory set		
					$('#video_link_txt').val(KAANGO.ca.videoLinkMemory); // Set video link
				
				$('#video_link_txt').bind('change', function() {
					KAANGO.ca.saveField('video_link', $(this).val());
				})
				$('#video_link_txt').bind('blur', function() { 
					KAANGO.ca.saveField('video_link', $(this).val());
				})
			},

			load: function() {
				
				$("#thumbnails_ul img[id^=thumbnail_img_src_]").each ( function() {
					$(this).vAlign();
				});

                KAANGO.log('max photos: ' + KAANGO.photos.max);
                KAANGO.log('current photos: ' + KAANGO.photos.count);

                var uploadLimit = Math.max(0, KAANGO.photos.max - KAANGO.photos.count);

                var placeHolderId = [KAANGO.swf_ph, KAANGO.swf_ph_c].join('_');
				
				step3PhotoUploader = new SWFUpload({
					// Flash Settings
					flash_url : KAANGO.swfupload[0],

					// Backend Settings
					upload_url: KAANGO.swfupload[1],
					post_params: {"adcart": KAANGO.adcart},

					// File Upload Settings
					file_size_limit : "20mb",
					file_types : "*.jpg",
					file_types_description : "JPG Images",
                    file_queue_limit : Math.max(.1, uploadLimit),
                    file_upload_limit: Math.max(.1, uploadLimit),
                    
					preserve_relative_urls : true,

					// Event Handler Settings - these functions as defined in
					// /resources/js/swfupload/handlers.js
					file_queue_error_handler : fileQueueError,
					file_dialog_complete_handler : fileDialogComplete,
					upload_progress_handler : uploadProgress,
					upload_error_handler : uploadError,
					upload_success_handler : uploadSuccess,
					upload_complete_handler : function() {
						var ret = uploadComplete.apply(this,arguments);
						return ret;
					},
					upload_start_handler : uploadStart,

					button_placeholder_id : placeHolderId,
					button_width: 225,
					button_height: 20,
					button_text : '<span class="photo-upload-button">Select Images To Upload (20 MB Max)</span>',
					button_text_style : '.photo-upload-button { ' + $('#photo_uploader_text').attr('style') + ' }',
					button_text_top_padding: 0,
					button_text_left_padding: 0,
					button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
					button_cursor: SWFUpload.CURSOR.HAND,
					custom_settings : {
						upload_target : "divFileProgressContainer"
					}
				});

                KAANGO.photos.uploader = step3PhotoUploader;
			},

			unload: function() {
				KAANGO.swf_ph_c = KAANGO.swf_ph_c + 1;
				
				this.find('object[id^="SWFUpload"]')
					.before($.create('div',{'id':[KAANGO.swf_ph, KAANGO.swf_ph_c].join('_')},'Select Images to Upload (20 MB Max)'))
					.remove();
					
				step3PhotoUploader.destroy();
			}
		}
	},

	transition: function(id)
	{
		var currentStep = $('#step_'+id);

			//currentStepTriggers = typeof KAANGO.triggers['step'+id] != 'undefined' ? KAANGO.triggers['step'+id] : {};
        
		function animateTransition(step)
		{
			var stepID = step.attr('id');
			var	stepIDNum = stepID.replace(/[^0-9]*/,''),
				stepTriggers = typeof KAANGO.triggers['step'+stepIDNum] != 'undefined' ? KAANGO.triggers['step'+stepIDNum] : {},
				loading = !step.find('.kng-ca-step-content:visible').length;

			if (loading)
			{
				if (typeof stepTriggers.init == 'function')
				{
					stepTriggers.init.call(step);
				}

				step.find('.step_bar').addClass('step_bar_active');
				step.find('.step_bar_numeral').removeClass('step_bar_numeral').addClass('step_bar_numeralOn');
				step.find('.step_bar_description').removeClass('step_bar_description').addClass('step_bar_descriptionOn');
				step.find('.step_bar_text').removeClass('step_bar_text').addClass('step_bar_text');
			}
			else
			{
				step.find('.step_bar').removeClass('step_bar_active').addClass('step_bar_visited');
				step.find('.step_bar_numeralOn').removeClass('step_bar_numeralOn').addClass('step_bar_numeral');
				step.find('.step_bar_descriptionOn').removeClass('step_bar_descriptionOn').addClass('step_bar_description');
				step.find('.step_bar_textOn').removeClass('step_bar_textOn').addClass('step_bar_text');

				if (typeof stepTriggers.unload == 'function')
				{
					stepTriggers.unload.call(step);
				}
			}

			step.find('.kng-ca-step-content').slideToggle(1500, function(){
				if (loading)
				{
					if (typeof stepTriggers.load == 'function')
					{
						stepTriggers.load.call(step);
					}
				}
				else
				{
					if (typeof stepTriggers.exit == 'function')
					{
						stepTriggers.exit.call(step);
					}

					function bindStepBarClick(stepNum,triggers) {
						 $('#step_' + stepNum + '_bar').one('click',function() {
                             
							function beginTransition() {
								KAANGO.ca.address.setStep(stepNum);
							}

                            var currentStepNum = $(currentStep).prop('id').replace(/[^0-9]*/,'');

							if (typeof KAANGO.triggers['step' + currentStepNum] == 'object' && typeof KAANGO.triggers['step' + currentStepNum].beforeUnload == 'function')
							{
								KAANGO.triggers['step' + currentStepNum].beforeUnload.call(currentStep,beginTransition,bindStepBarClick);
							}
							else
							{
								beginTransition(stepNum);
							}
						}).css('cursor', 'hand').css('cursor', 'pointer');
					}
					for (var i = stepIDNum; i > 0; i--)
					{
						bindStepBarClick(i,KAANGO.triggers['step'+i] || {});
					}
				}
			});
		}

		KAANGO.ca.analytics('placeAdStep' + id);
		// $('html,body').animate(scrollTop) executes callback twice
		$('html').animate({scrollTop:$('#kng-create-ad-wrapper').offset().top}, 500, function() {
			// KAANGO.ca.animateCostingBox();
			animateTransition($('.processStep:has(.kng-ca-step-content:visible)'));
			animateTransition(currentStep);
		});
	}

});

Upsells = {
	items: {
			'free_photos' : 7,
			'charged_photos' : 5,
			'adhoc_ext_days' : 4
	},

	queue: [],

	determine: function (id, checked)
	{
		if (checked === true)
		{
			this.add(id);
		}
		else
		{
			this.remove(id, true);
		}
	},

	buildValues: function (upsell)
	{
		var values = {id: '', quantity: 1, update: 1};

		if (typeof(upsell) === 'object')
		{
			values.id = upsell.id;
			values.quantity = upsell.quantity || 1;
			values.update = (typeof upsell.update === 'boolean' && upsell.update === false) ? 0 : 1;
		}
		else
		{
			values.id = upsell;
		}

		values.id = parseInt(values.id);

		return values;
	},

	add: function(upsell)
	{
		var values = this.buildValues(upsell);

		if (jQuery.inArray(values.id, KAANGO.upsells) == -1)
		{
			KAANGO.upsells.push(values.id);
		}

		this.schedule(values.id, values.quantity, 1, values.update);
	},

	remove: function(upsell)
	{
		var values = this.buildValues(upsell);

		if (arguments.length != 2 || arguments[1] === true)
		{
			for (var key in KAANGO.upsells)
			{
				if (KAANGO.upsells[key] == values.id)
				{
					/*
					 * Remove It Out of the Master Array Because This Will Be
					 * Used to Rebuild the Items if the User Chooses and
					 * Unchooses a Bundle
					 */
					KAANGO.upsells.splice(key, 1);
					break;
				}
			}
		}

		this.schedule(values.id, -1, 0, values.update);
	},

	schedule: function (id, quantity, add, update)
	{
		this.queue.push([id, quantity, add, update]);

		if (this.queue.length == 1)
		{
			this.process();
		}
	},

	process: function()
	{
		this.run(this.queue[0][0], this.queue[0][1], this.queue[0][2], this.queue[0][3]);
	},

	run: function (id, quantity, add, update)
	{
		KAANGO.util.ajax('addremoveupsell', {data: {'upsellId': id, 'quantity': quantity, 'add': add, 'update': update},
			success: function(json)
			{
				if (json.length != 0)
				{
					CostingBox.buildFromOrder(json);

                    if (id == 4)
                    {
                        KAANGO.ca.setExpirationDate();
                    }
				}
			},

			complete: function()
			{
				Upsells.queue.splice(0, 1);

				if (Upsells.queue.length > 0)
				{
					Upsells.run(Upsells.queue[0][0], Upsells.queue[0][1], Upsells.queue[0][2], Upsells.queue[0][3]);
				}
				else if (update == 1)
				{
					CostingBox.highlight();
				}
			}
		});
	}
}

Transitions = {
	transitionQueueShow: [],
	transitionQueueHide: []
};

// Function to change the properties of the Ad
function editAd(obj,type){
	switch(type){

		case 'ZipCode':
			var zip_code = $(obj).find('input[id="zip_code"]');
						if(KAANGO.zip_code != $(zip_code).val()){
							KAANGO.zip_code = $(zip_code).val();
							//KAANGO.ca.edit.updateAd({});
						}
						var tmpobj = $(obj).parents("p");
						var tmp = $(tmpobj).find("strong").html();
						//$(tmpobj).html("<strong>"+tmp+"</strong>" + $(zip_code).val() + ' <a id="editZipCode" role="link" class="link">edit postal code</a>');
						$(tmpobj).html("<strong>"+tmp+"</strong>" + $(zip_code).val());
						KAANGO.ca.editZipCode($(zip_code).val());
		break;

		default: return false;
		break;
	}
}

function confirmExit()
{
	KAANGO.ca.autoSave();
	return "\nYour changes will be lost if you have not saved them. You can easily save your changes by selecting the Save & Finish Later button.\n";
}
// flash version based by adobe code

// Flash Player Version Detection - Rev 1.6
// Detect Client Browser type
// Copyright(c) 2005-2006 Adobe Macromedia Software, LLC. All rights reserved.

function getFlash(t){
	
	
	var isIE  = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
	var isWin = (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false;
	var isOpera = (navigator.userAgent.indexOf("Opera") != -1) ? true : false;

	function ControlVersion()
	{
		var version;
		var axo;
		var e;
		// NOTE : new ActiveXObject(strFoo) throws an exception if strFoo isn't in the registry
		try {
			// version will be set for 7.X or greater players
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
			version = axo.GetVariable("$version");
		} catch (e) {
		
		}
		if (!version)
		{
			try {
				// version will be set for 6.X players only
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
				// default to the first public version
				version = "WIN 6,0,21,0";
				// throws if AllowScripAccess does not exist (introduced in 6.0r47)		
				axo.AllowScriptAccess = "always";

				// safe to call for 6.0r47 or greater
				version = axo.GetVariable("$version");

			} catch (e) {
			
			}
		}

		if (!version)
		{
			try {
				// version will be set for 4.X or 5.X player
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
				version = axo.GetVariable("$version");
			} catch (e) {
			
			}
		}

		if (!version)
		{
			try {
				// version will be set for 3.X player
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
				version = "WIN 3,0,18,0";
			} catch (e) {
			
			}
		}

		if (!version)
		{
			try {
				// version will be set for 2.X player
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
				version = "WIN 2,0,0,11";
			} catch (e) {
				version = -1;
			}
		}
		return version;
	}

	// JavaScript helper required to detect Flash Player PlugIn version information
	function GetSwfVer(){
		// NS/Opera version >= 3 check for Flash plugin in plugin array
		var flashVer = -1;
		if (navigator.plugins != null && navigator.plugins.length > 0) {
			if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]) {
				var swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
				var flashDescription = navigator.plugins["Shockwave Flash" + swVer2].description;
				var descArray = flashDescription.split(" ");
				var tempArrayMajor = descArray[2].split(".");			
				var versionMajor = tempArrayMajor[0];
				var versionMinor = tempArrayMajor[1];
				var versionRevision = descArray[3];
				if (versionRevision == "") {
					versionRevision = descArray[4];
				}
				if (versionRevision[0] == "d") {
					versionRevision = versionRevision.substring(1);
				} else if (versionRevision[0] == "r") {
					versionRevision = versionRevision.substring(1);
					if (versionRevision.indexOf("d") > 0) {
						versionRevision = versionRevision.substring(0, versionRevision.indexOf("d"));
					}
				}
				var flashVer = versionMajor + "." + versionMinor + "." + versionRevision;
			}
		}
		// MSN/WebTV 2.6 supports Flash 4
		else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) flashVer = 4;
		// WebTV 2.5 supports Flash 3
		else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) flashVer = 3;
		// older WebTV supports Flash 2
		else if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1) flashVer = 2;
		else if ( isIE && isWin && !isOpera ) {
			flashVer = ControlVersion();
		}	
		return flashVer;
	}

	function DetectFlashVer(reqMajorVer, reqMinorVer, reqRevision)
	{
		versionStr = GetSwfVer();
		if (versionStr == -1 ) {
			return false;
		} else if (versionStr != 0) {
			if(isIE && isWin && !isOpera) {
				// Given "WIN 2,0,0,11"
				tempArray         = versionStr.split(" "); 	// ["WIN", "2,0,0,11"]
				tempString        = tempArray[1];			// "2,0,0,11"
				versionArray      = tempString.split(",");	// ['2', '0', '0', '11']
			} else {
				versionArray      = versionStr.split(".");
			}
			var versionMajor      = versionArray[0];
			var versionMinor      = versionArray[1];
			var versionRevision   = versionArray[2];

				// is the major.revision >= requested major.revision AND the minor version >= requested minor
			if (versionMajor > parseFloat(reqMajorVer)) {
				return true;
			} else if (versionMajor == parseFloat(reqMajorVer)) {
				if (versionMinor > parseFloat(reqMinorVer))
					return true;
				else if (versionMinor == parseFloat(reqMinorVer)) {
					if (versionRevision >= parseFloat(reqRevision))
						return true;
				}
			}
			return false;
		}
	}
	if(typeof(t) != 'undefined') {
		var version = t.split('.'); 
		return DetectFlashVer(version[0], version[1], version[2])
	} else {
		return GetSwfVer();
	}

	// Used for running unit tests.
	// <?php loadUnitTest('/js-tests/tests/createad.tests.js'); ?>
	
	
}
