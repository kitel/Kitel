var KAANGO = KAANGO || {};

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 *
 * dateFormat.masks --- Options ---
 * Name                         Mask                                                    Example
 * default                      ddd mmm dd yyyy HH:MM:ss                Sat Jun 09 2007 17:46:21
 * shortDate            m/d/yy                                                  6/9/07
 * mediumDate           mmm d, yyyy                                     Jun 9, 2007
 * longDate             mmmm d, yyyy                                    June 9, 2007
 * fullDate             dddd, mmmm d, yyyy                              Saturday, June 9, 2007
 * shortTime            h:MM TT                                                 5:46 PM
 * mediumTime           h:MM:ss TT                                              5:46:21 PM
 * longTime             h:MM:ss TT Z                                    5:46:21 PM EST
 * isoDate                      yyyy-mm-dd                                              2007-06-09
 * isoTime                      HH:MM:ss                                                17:46:21
 * isoDateTime          yyyy-mm-dd'T'HH:MM:ss                   2007-06-09T17:46:21
 * isoUtcDateTime       UTC:yyyy-mm-dd'T'HH:MM:ss'Z'    2007-06-09T22:46:21Z
 */
var dateFormat=function(){var token=/d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,timezone=/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,timezoneClip=/[^-+\dA-Z]/g,pad=function(val,len){val=String(val);len=len||2;while(val.length<len)val="0"+val;return val};return function(date,mask,utc){var dF=dateFormat;if(arguments.length==1&&Object.prototype.toString.call(date)=="[object String]"&&!/\d/.test(date)){mask= date;date=undefined}date=date?new Date(date):new Date;if(isNaN(date))throw SyntaxError("invalid date");mask=String(dF.masks[mask]||mask||dF.masks["default"]);if(mask.slice(0,4)=="UTC:"){mask=mask.slice(4);utc=true}var _=utc?"getUTC":"get",d=date[_+"Date"](),D=date[_+"Day"](),m=date[_+"Month"](),y=date[_+"FullYear"](),H=date[_+"Hours"](),M=date[_+"Minutes"](),s=date[_+"Seconds"](),L=date[_+"Milliseconds"](),o=utc?0:date.getTimezoneOffset(),flags={d:d,dd:pad(d),ddd:dF.i18n.dayNames[D],dddd:dF.i18n.dayNames[D+ 7],m:m+1,mm:pad(m+1),mmm:dF.i18n.monthNames[m],mmmm:dF.i18n.monthNames[m+12],yy:String(y).slice(2),yyyy:y,h:H%12||12,hh:pad(H%12||12),H:H,HH:pad(H),M:M,MM:pad(M),s:s,ss:pad(s),l:pad(L,3),L:pad(L>99?Math.round(L/10):L),t:H<12?"a":"p",tt:H<12?"am":"pm",T:H<12?"A":"P",TT:H<12?"AM":"PM",Z:utc?"UTC":(String(date).match(timezone)||[""]).pop().replace(timezoneClip,""),o:(o>0?"-":"+")+pad(Math.floor(Math.abs(o)/60)*100+Math.abs(o)%60,4),S:["th","st","nd","rd"][d%10>3?0:(d%100-d%10!=10)*d%10]};return mask.replace(token, function($0){return $0 in flags?flags[$0]:$0.slice(1,$0.length-1)})}}();dateFormat.masks={"default":"ddd mmm dd yyyy HH:MM:ss",shortDate:"m/d/yy",mediumDate:"mmm d, yyyy",longDate:"mmmm d, yyyy",fullDate:"dddd, mmmm d, yyyy",shortTime:"h:MM TT",mediumTime:"h:MM:ss TT",longTime:"h:MM:ss TT Z",isoDate:"yyyy-mm-dd",isoTime:"HH:MM:ss",isoDateTime:"yyyy-mm-dd'T'HH:MM:ss",isoUtcDateTime:"UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"}; dateFormat.i18n={dayNames:["Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],monthNames:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","January","February","March","April","May","June","July","August","September","October","November","December"]};Date.prototype.format=function(mask,utc){return dateFormat(this,mask,utc)};

(function(g){g.fn.extend({serializeForPHP:function(){var f=[];this.each(function(){var b=g(this),h=b.attr("name"),d=b.attr("type"),a=b.val();if(b.is(":input")){if(b.hasClass("hasDatepicker")){var e=b.datepicker("getDate"),c;if(e!=null){a=e.getMonth()+1;c=e.getDate();if(a<10)a="0"+String(a);if(c<10)c="0"+String(c);a=e.getFullYear()+"-"+a+"-"+c}}if(a)if(d=="select-multiple"||d=="checkbox"){if(d!="checkbox"||b.attr("checked"))f.push(h+"[]="+encodeURIComponent(a))}else d=="radio"&&!b.attr("checked")|| f.push(h+"="+encodeURIComponent(a))}});return f.join("&")}})})(jQuery);

function watchCountdown(periods) {
   $('#c_down').text('Redirecting In ' +  periods[6] + ' Seconds');
}

$.extend(true,KAANGO, {
        log: function(message)
        {
                try
                {
                        console.log(message)
                }
                catch(e)
                {
                        //fail with grace
                }
        },
        info: function(message)
        {
                try
                {
                        console.info(message)
                }
                catch(e)
                {
                        //fail with grace
                }
        },
        trace: function(message)
        {
                try
                {
                        console.trace(message)
                }
                catch(e)
                {
                        //fail with grace
                }
        },
        error: function(message)
        {
                try
                {
                        console.error(message)
                }
                catch(e)
                {
                        //fail with grace
                }
        },
        
        util: {
            timeSelector: function(prefix, edit, hour, minute)
            {
                var is24Hour = false,
                    curDate = new Date(),
                    pad = function(numNumber, numLength) {
                        var strString = '' + numNumber;

                        while(strString.length<numLength)
                        {
                            strString = '0' + strString;
                        }

                        return strString;
                    };

                if ($('#is24Hour').length > 0 && $('#is24Hour').val() == 1)
                {
                    is24Hour = true;
                }

                if (is24Hour)
                {
                    var hours = {'00' : '00', '01' : '01', '02' : '02', '03' : '03', '04' : '04', '05' : '05', '06' : '06', '07' : '07', '08' : '08', '09' : '09', '10' : '10',
                                 '11' : '11', '12' : '12', '13' : '13', '14' : '14', '15' : '15', '16' : '16', '17' : '17', '18' : '18', '19' : '19', '20' : '20', '21' : '21', '22' : '22', '23' : '23'
                                };
                }
                else
                {
                    var hours = {'01' : '01', '02' : '02', '03' : '03', '04' : '04', '05' : '05', '06' : '06',
                                 '07' : '07', '08' : '08', '09' : '09', '10' : '10', '11' : '11', '12' : '12'
                                }
                }

                var hourSelect = $.create('select', {'id' : prefix + '-hours'}).addOption(hours, false).sortOptions();

                var minutes = {'00' : '00', '01' : '01', '02' : '02', '03' : '03', '04' : '04', '05' : '05', '06' : '06', '07' : '07', '08' : '08', '09' : '09', '10' : '10',
                               '11' : '11', '12' : '12', '13' : '13', '14' : '14', '15' : '15', '16' : '16', '17' : '17', '18' : '18', '19' : '19', '20' : '20', '21' : '21', '22' : '22', '23' : '23',
                               '24' : '24', '25' : '25', '26' : '26', '27' : '27', '28' : '28', '29' : '29', '30' : '30', '31' : '32', '33' : '33', '34' : '34', '35' : '35', '36' : '36', '37' : '37', '38' : '38',
                               '39' : '39', '40' : '40', '41' : '41', '42' : '42', '43' : '43', '44' : '44', '45' : '45', '46' : '46', '47' : '47', '48' : '48', '49' : '49', '50' : '50',
                               '51' : '51', '52' : '52', '53' : '53', '54' : '54', '55' : '55', '56' : '56', '57' : '57', '58' : '58', '59' : '59'
                              };

                var minuteSelect = $.create('select', {'id' : prefix + '-minute'}).addOption(minutes, false).sortOptions(),
                    divWrapper = $.create('div'), sep = $.create('span', {}, [': ']),
                    timezoneOffset = $.create('input', {'type' : 'hidden', 'id' : prefix + '-timezone-offset', 'value' : curDate.getTimezoneOffset()});

                $(divWrapper).append(timezoneOffset).append(hourSelect).append(sep).append(minuteSelect);

                if (is24Hour)
                {
                    var amPM = $.create('input', {'id' : prefix + '-meridiem', 'type' : 'hidden', 'value' : 'no'});

                    $(divWrapper).append(amPM);

                    $(minuteSelect).selectOptions(pad(curDate.getMinutes(), 2));

                    $(currentHour).selectOptions(pad(curDate.getHours(), 2));
                }
                else
                {
                    var amPM = $.create('select', {'id' : prefix + '-meridiem'}).addOption({'AM' : 'AM', 'PM' : 'PM'}, false).sortOptions();

                    $(divWrapper).append(amPM);

                    if (edit)
                    {
                        $(minuteSelect).selectOptions(pad(minute, 2));
                    }
                    else
                    {
                        $(minuteSelect).selectOptions(pad(curDate.getMinutes(), 2));
                    }

                    if (edit)
                    {
                        var currentHour = pad(hour, 2);

                    }
                    else
                    {
                        var currentHour = curDate.getHours();
                    }

                    if (currentHour == 12)
                    {
                        $(hourSelect).selectOptions('12');
                        $(amPM).selectOptions('PM');
                    }
                    else if (currentHour > 12)
                    {
                        $(hourSelect).selectOptions(pad(currentHour - 12, 2));
                        $(amPM).selectOptions('PM');
                    }
                    else if (currentHour == 0 || currentHour == 00)
                    {
                        $(hourSelect).selectOptions('00');
                        $(amPM).selectOptions('PM');
                    }
                    else
                    {
                        $(hourSelect).selectOptions(pad(currentHour, 2));
                        $(amPM).selectOptions('AM');
                    }
                }

                return divWrapper;
            },

                monetize: function (c) {
                        return (c == 0 || c == 0.00) ? 'FREE!' : '$ ' + parseFloat(c).toFixed(2);
                },
                
                analytics: function(category, action, optional)
                {
                        /*
                         * This Is Based on the Google Analytics Event Tracking
                         * http://code.google.com/apis/analytics/docs/tracking/eventTrackerGuide.html
                         */
                        if (typeof pageTracker == 'object' && typeof pageTracker._trackEvent == 'function')
                        {
                                /**
                                 * category - The name you supply for the group of objects you want to track
                                 * action - A string that is uniquely paired with each category, and commonly
                                 *                      used to define the type of user interaction for the web object
                                 * label - An optional string to provide addtional dimensions to the event data
                                 * value - An integer that you can use to provide unumber data about the user event
                                 *
                                 * returns - Boolean whether the event was successfully sent. 
                                 */
                                if (typeof optional.label != 'undefined' && typeof optional.value != 'undefined')
                                {
                                        var t = pageTracker._trackEvent(category, action, optional.label, optional.value);
                                }
                                else if (typeof optional.label != 'undefined')
                                {
                                        var t = pageTracker._trackEvent(category, action, optional.label);
                                }
                                else
                                {
                                        var t = pageTracker._trackEvent(category, action);
                                }
                        }
                },
        
                title: function (s) {
                        document.title = KAANGO.title.replace('%st%', s);
                },
        
                history: function (s) {
                        $.history( {'step': s} );
                },

                
                loadScript: function (fn, id, callback) {
                        KAANGO.loadedScript = KAANGO.loadedScript || [];
                        KAANGO.tags = KAANGO.tags || [];
                        KAANGO.js_loaded = KAANGO.js_loaded || [];
                        // Check to See If the Script is Already Loaded
                        for (var i in KAANGO.loadedScript)
                        {
                                if (KAANGO.loadedScript[i] == id)
                                {
                                        if(KAANGO.tags[id] && $.isArray(KAANGO.tags[id]) && $.isFunction(callback)) {
                                            if(KAANGO.js_loaded[id]) {
                                                callback();
                                            } else {
                                                KAANGO.tags[id].push(callback);
                                            }
                                        }
                                        return false;
                                }
                        }
                        KAANGO['loadedScript'].push(id);
                        KAANGO.js_loaded[id] = false;
                        var url =  (KAANGO.file_path ? [KAANGO.file_path, fn].join('') : '/resources/js/'+fn);

                        KAANGO.tags[id] = [];
                        if($.isFunction(callback)) {
                            KAANGO.tags[id].push(callback);
                        }

                        var triggerCallbacks = function() {
                            KAANGO.js_loaded[id] = true;
                            if($.isArray(KAANGO.tags[id])) {
                                $.each(KAANGO.tags[id], function(index, value) {
                                    value();
                                });
                            }
                        };
                        // loads a script and executes it, WITH caching (we want to cache)
                        $.ajax({
                          async: true,
                          url: url,
                          dataType: 'script',
                          success: triggerCallbacks,
                          cache: true
                        });
                        return true;
                },
        
                ajax: function(u, opts) {
                        if (typeof opts == 'undefined')
                        {
                                opts = {};
                        }

                        return $.ajax({
                                cache: opts.cache || false,
                                url: (u.charAt(0) == '/') ? u : '/ads/ajax/' + u,
                                type: opts.type || 'POST',
                                // breaking after upgrade to jQuery - 1.5.1
                                // dataType: opts.dataType || 'json',
                                data: opts.data || null,
                                timeout: opts.timeout || '10000',
                                async: typeof(opts.async) === 'undefined' ? true : opts.async,
        
                                error: function(xhr, textStatus, errorThrown)
                                {
                                        if(typeof opts['error'] == 'function')
                                        {
                                                opts['error'](xhr, textStatus, errorThrown);
                                        }
                                        else
                                        {
                                            KAANGO.error(textStatus);
                                            KAANGO.error(errorThrown);
                                            $.jGrowl("An unexpected error has occurred. We apologize for the inconvenience.",
                                                { header: 'Unexpected Error' , life: 5000  });
                                        }
                                },
        
                                success: function(json)
                                {
                                        if(typeof opts['success'] == 'function')
                                        {
                                                opts['success'](json);
                                        }
                                },
                                
                                complete: function(XMLHttpRequest, textStatus)
                                {
                                        if(textStatus == 'success' && typeof opts['complete'] == 'function')
                                        {
                                                opts['complete']();
                                        }
                                }
                        });
                },
        
                // Sets Default Values For the jQuery UI Dialog Box
                ui_dialog_default: function ()
                {
                    $.ui.dialog.prototype.options.bgiframe = true;
                    $.ui.dialog.prototype.options.resizable = false;
                    $.ui.dialog.prototype.options.modal = true;
                    $.ui.dialog.prototype.options.closeOnEscape = true;
                    $.ui.dialog.prototype.options.draggable = false;
                    $.ui.dialog.prototype.options.width = 390;
                    $.ui.dialog.prototype.options.overlay = {backgroundColor: '#000', opacity: 0.4};
                }
        },

        html: {
                /**
                 * Builds the Form Element for the Ad Nature
                 *
                 * @param string html_string The setup of the html from KAANGO.html_setup
                 * @param form_section string The HTML Form Div Id
                 * @param section string The HTML Div Id That Wraps the Form Elements
                 * @param object form_fields = {
                 *              a: "<br><span style="font-size:10px;">Give a general rate description</span>" -- Content That Goes After the Ad Nature
                 *        b: "" -- Content That Goes Before the Ad Nature Input Gets Displayed
                 *        be = "" -- Content That Goes Below the Ad Nature On Its On Line
                 *        d = "" -- Default Value for the Given Form Value
                 *        hf = "title_above" -- The HTML Setup for the Ad Nature
                 *        i = "service_rates" -- The Id Of the HTML Form Element
                 *        n = "service_rates" -- The Name of the HTML Form Element
                 *        it = "textarea" -- The Input Type of the HTML Form Element
                 *        ml = "20" -- The Max Length of a HTML Input Form Element
                 *        o = "" -- The Options For a HTML Select Form Element
                 *        r = false|true -- If the Field is Required
                 *        sld = "" -- The Selected Value for the HTML Select Form Element
                 *        sz = "50" -- The size of the Element
                 *        t = "Service Rates" -- The Title of the Form Elements
                 *        tp = "textarea" -- The Input Type of the HTML Form Element
                 * } Contains the Entire Ad Nature Setup
                 * @param int index The Number of Times Through a Section
                 * @param string name The Name of the HTML Form Element
                 * @param string name The ID of the HTML Form Element
                 */
                generate: function (html_string, form_section, section, form_fields, index, name, id) {
                        var fs_i = [form_section, 'input', index].join('_');

                        var optional_required_class = '';

                        if (html_string === null)
                        {
                                optional_required_class = name.substr(name.indexOf('_')+1);
                                // This Setups the a Parent Child Relationship. It Will Not Have any Title, So it Gets Displayed Next to Another Form Field
                                $.create('span', {'id': form_section,'class':'adnat-generated-children '+optional_required_class}).insertBefore('#' + section + ' > .adnat-below');
                                
                                if (form_fields.a != '')
                                {
                                        $.create('span', {'class':'adnat-after '+optional_required_class}, form_fields.a).insertBefore('#' + section + ' > .adnat-below');
                                }
                                
                                fs_i = form_section;
                        }
                        else
                        {
                                html_string = this.replace.title(html_string, form_fields.t);
                                html_string = this.replace.title_extra(html_string, form_fields.te || '');
                                html_string = this.replace.before(html_string, form_fields.b || '');
                                html_string = this.replace.after(html_string, form_fields.a || '');
                                html_string = this.replace.below(html_string, form_fields.be || '');
                                html_string = this.replace.input_id(html_string, fs_i);
                                html_string = this.replace.label_id(html_string, id);
                                

                                if(form_section.indexOf('_optional_')>0){
                                        optional_required_class = form_section.substr(form_section.indexOf('_optional_')+10);
                                }
                                if(form_section.indexOf('_required_')>0){
                                        optional_required_class = form_section.substr(form_section.indexOf('_required_')+10);
                                }
                                if(optional_required_class.indexOf('_')>0){
                                        optional_required_class = optional_required_class.substr(optional_required_class.indexOf('_')+1);
                                }
                            
                                $.create('li', {'id': form_section, 'class': form_fields.tp + ' adnat-generated ' + optional_required_class}).appendTo('#' + section).append(html_string);

                                if ($('#' + form_section + ' > .adnat-before').html() != null && $('#' + form_section + ' > .adnat-before').html().length > 5)
                                {
                                    $('#' + form_section + ' > .adnat-input').css("margin-left", "185px");
                                }
                        }

                        if (form_fields.e) // It is Editable
                        {
                                /*
                                 * Setups the Form Type that Is Going to Be Created defined by ad natures in the database
                                 */
                                switch(form_fields.tp)
                                {

                                        case 'text':case 'text_integer':case 'text_float':case 'date':
                                                
                                                var size = (form_fields.sz) ? form_fields.sz : this.form_creation.defaults.text.size;
                                                if (size > 50) { // set the max limit for our UI
                                                        size = 50;
                                                }
                                                var maxlength = (form_fields.ml) ? form_fields.ml : this.form_creation.defaults.text.maxlength;
                
                                                var class_name = size<=8?'small':size>8 && size<=16?'medium':size>16 && size<=30?'large':'full';
        
                                                this.form_creation.input_text(fs_i, name, id, form_fields.v, size, maxlength, class_name);
                
                                                if (form_fields.tp == 'date')
                                                {
                                                        JUI.datepicker(); // Loads in the Javascript Files Needed to Support The Date Picker

                                                        // Locks the user into what they selected through the date picker
                                                        $('#' + id).attr('readonly', 'readonly');
                
                                                        /*
                                                         * Binds the Jquery UI Datepicker (http://jqueryui.com/demos/datepicker/) to the Input Field Just Created
                                                         */
                                                        $(function() {
                                                                var mindate = new Date();
                                                        //      mindate.setDate(mindate.getDate()+1);
                                                                $('#' + id).datepicker({
                                                                        numberOfMonths: 2,
                                                                        showButtonPanel: true,
                                                                        minDate: mindate,
                                                                        buttonImage: '/resources/img/calendar.gif',
                                                                        buttonImageOnly: true, 
                                                                        showOn: 'both',
                                                                        dateFormat: $('#datepickerFormat').text(),
                                                                        onClose: function(date) {
                                                                                if (typeof KAANGO.ca.saveField == 'function')
                                                                                {
                                                                                    var dateObj = $(this).datepicker('getDate');
                                                                                    if(dateObj != null) {
                                                                                        var month = dateObj.getMonth() + 1,
                                                                                            day = dateObj.getDate();
                                                                                        if(month < 10) {
                                                                                            month = '0' + String(month);
                                                                                        }
                                                                                        if(day < 10) {
                                                                                            day = '0' + String(day);
                                                                                        }
                                                                                        date = dateObj.getFullYear() + '-' + month + '-' + day;
                                                                                        KAANGO.ca.saveField($(this).attr('name'), date);
                                                                                    }
                                                                                }
                                                                        },
                                                                        onSelect: function(date) {
                                                                                var endName = name.replace(/start/gi,"end");
                                                                                if(endName != name)
                                                                                {
                                                                                        var minDateEnd = $(this).datepicker('getDate');
                                                                                        $("input#"+endName).datepicker('option','minDate',minDateEnd);
                                                                                }
                                                                        }
                                                                });
                                                        });
                                                }
                                                break;
                                        case 'textarea':
                                                var cols = (form_fields.sz && parseInt(form_fields.sz) != 0) ? form_fields.sz : this.form_creation.defaults.textarea.cols;
                                                var rows = (form_fields.he && parseInt(form_fields.he) != 0) ? form_fields.he : this.form_creation.defaults.textarea.rows;
                                                this.form_creation.textarea(fs_i, name, id, cols, rows, form_fields.tp, form_fields.v, false);
                                                break;
                                        case 'wysiwyg':
                                                KAANGO.wysiwyg.push(id);
                                                this.form_creation.textarea(fs_i, name, id, 490, 250, form_fields.tp, form_fields.v, true);
                                                $('#' + id).addClass('adnature_wysiwyg');
                                                break;
                                        case 'select':
                                                var size = (form_fields.he) ? form_fields.he : null;
                                                this.form_creation.select(fs_i, name, id, form_fields.o, size, form_fields.v, false);
                                                break;
                                        case 'select_multi':
                                                var size = (form_fields.he) ? form_fields.he : null;
                                                this.form_creation.select(fs_i, name, id, form_fields.o, size, form_fields.v, true);
                                                break;
                                        case 'radio':
                                                this.form_creation.radio(fs_i, name, id, form_fields.v, form_fields.o);
                                                break;
                                        case 'checkbox': case 'check_multi': case 'check':
                                                this.form_creation.checkbox(fs_i, name, id, form_fields.v, form_fields.o);
                                                break;
                                        default:
                                                return false;
                                                break;
                                }
                        }
                        else
                        {
                            $('#' + fs_i).text(form_fields.v).addClass('text_only');
                        }
                        
                        /**
                         * Setups the External Load Parameters for a Given Ad Nature Field - ie. YMMS
                         */
                        if (typeof(form_fields.el) !== 'undefined' && form_fields.el.length != 0)
                        {
                                // Binds the Form Change Out to a New Field
                                $("select[name='" + form_fields.el.change + "']").change(function() {
                                        var params = {};
        
                                        for (key in form_fields.el.get)
                                        {
                                                params[['ext', form_fields.el.get[key]].join('_')] = $('#' + form_fields.el.get[key]).selectedOptions()[0].text;
                                        }
        
                                        params['fieldId'] = form_fields.el.field;
        
                                        KAANGO.util.ajax('externaldata',{"data": params,
                                                        "success":function(json) {
                                                                // Removes Any Data Inside the Form Fields So the User Is Clear on the Path
                                                                for(key in form_fields.el.clear)
                                                                {
                                                                        $('#' + form_fields.el.clear[key]).removeOption(/./).addOption({'-1': 'Please Choose'}).attr('disabled', 'disabled');
                                                                }
        
                                                                // Loads All the New Data Returned into the Other Select Box
                                                                $('#' + form_fields.el.act).removeOption(/./).addOption(json).prop({'disabled': ($('#' + form_fields.el.change).val() === 'choose'), 'selectedIndex': 0});
                                                        }
                                        });
                                });
                        }
                },
        
                /**
                 * Replaces Part of the HTML String Setup With the Content From Ad Natures Based on What is Defined in the Database
                 *
                 * DEFINED IN THE KAANGO JSON OBJECT
                 * .....
                 * html_setup: {title_above: '%title% %title_extra%<div id="%input_id%"></div>',
                 *                               title_left: '%title% %before% <div class="child-inline" id="%input_id%"></div> %after%%below%'},
                 * .....
                 *
                 */
                replace: {
                        default_seperator: ':',
        
                        /**
                         * @param string search The Current HTML String For the Ad Nature
                         * @param string replace The Current Wording that Needs to Replace the Specific Part of the HTML String
                         */
                        title: function (search, replace) {
                                return this.do_replace(search, 'title', [replace, this.default_seperator].join(''));
                        },
        
                        title_extra: function (search, replace) {
                                return this.do_replace(search, 'title_extra', replace);
                        },
        
                        label_id: function (search, replace) {
                                return this.do_replace(search, 'label_id', replace);
                        },
        
                        input_id: function (search, replace) {
                                return this.do_replace(search, 'input_id', replace);
                        },
        
                        before: function (search, replace) {
                                return this.do_replace(search, 'before', replace);
                        },
        
                        after: function (search, replace) {
                                return this.do_replace(search, 'after', replace);
                        },
        
                        below: function (search, replace) {
                                return this.do_replace(search, 'below', (replace != '') ? ['<br />', replace].join('') : replace);
                        },
        
                        do_replace: function (search, find, replace) {
                                return search.replace('%' + find + '%', replace);
                        }
                },
        
                form_creation: {
                        defaults: {
                                text: {
                                        maxlength: 255,
                                        size: 50
                                },
                                textarea: {
                                        cols: 40,
                                        rows: 7
                                }
                        },
        
                        element_button: 'button',
                        element_input: 'input',
                        element_select: 'select',
                        element_textarea: 'textarea',
        
                        element_input_type_image: 'image',
                        element_input_type_checkbox: 'checkbox',
                        element_input_type_radio: 'radio',
                        element_input_type_text: 'text',
        
                        next_option: function (div, selected, object)
                        {
                                var d_n = '#' + div;
                                
                                for (key in object)
                                {
                                        if (key == selected)
                                        {
                                                this.add_multiple_options($(d_n), object[key], false);
                                        }
                                }
                        },
        
                        add_multiple_options: function (html_element, items, selected) {
                                if (selected == null)
                                {
                                        selected = false;
                                }

                            if (html_element.attr('id') == 'category_selector_2' || html_element.attr('id') == 'category_selector_3' || html_element.attr('id') == 'category_selector_4')
                            {
                                $(html_element).addOption(items, selected);
                            }
                            else if (html_element.attr('id') == 'vehicle_model_year')
                            {
                                $(html_element).addOption(items, selected).sortOptions(false);
                            }
                            else
                            {
                                $(html_element).addOption(items, selected).sortOptions();
                            }


                            if ($(html_element).containsOption('0'))
                            {
                                // puts the please choose item back at the beginning of the list
                                $(html_element).removeOption('0').prepend("<option value='0'>Please Choose</option>").selectOptions('0', true);
                            }
                            else if ($(html_element).containsOption('choose'))
                            {
                                var text = $(html_element).children('option[value="choose"]').text();

                                // puts the please choose item back at the beginning of the list
                                $(html_element).removeOption('choose').prepend("<option value='choose'>" + text + "</option>").selectOptions('choose', true);
                            }
                        },
        
                        option: function (html_element, name, value, selected) {
                                if (selected == null)
                                {
                                        selected = false;
                                }
                                $(html_element).addOption(name, value, selected);
                        },
        
                        input_text: function (div, name, id, value, size, maxlength, class_name) {
                                $('#' + div).append(this.input(this.element_input_type_text, name, id, value, size, maxlength, class_name));
                        },
        
                        input: function (type, name, id, value, size, maxlength, class_name) {
                                return this.element({'element': this.element_input, 'type': type, 'id': id, 'name': name, 'value': value, 'size': size, 'maxlength': maxlength, 'class_name': class_name});
                        },
        
                        button: function (div, name, id, value)
                        {
                                $('#' + div).append(this.element({'element': this.element_input, 'type': this.element_button, 'id': id, 'name': name, 'value': value}));
                        },
        
                        checkbox_only: function (name, id, value, extra) {
                                try{
                                        // IE - HACK
                                        return document.createElement('<input type="checkbox" name="' + name + '" id="' + id + '" value="' + current_key + '" ' + extra + ' />');
                                }catch(err){
                                        return this.element({'element': this.element_input, 'type': this.element_input_type_checkbox, 'id': id, 'name': name, 'value': value, 'extra': extra});
                                }
                        },
        
                        upsellCheckbox: function(data)
                        {
                                $('#upsellList').append($.create('dd',{id:'upsell_dd_' + data.itemId}));
                                
                                var input = $.create('input',{name: 'upsell',type: 'checkbox',id:'upsell_' + data.itemId,value:data.offerId,'class': 'upsellCheckbox'});
                                $('#upsell_dd_' + data.itemId)
                                                .append(input)
                                                .append($.create('label', {'for': 'upsell_' + data.itemId, 'class': 'upsell-item-description'}).html(data.itemDescription))
                                                .append($.create('span', {'class': 'upsell-item-cost'}).html(data.price_extra + '' + KAANGO.util.monetize(data.offerPrice)));
                        
                                if (data.checked == 1)
                                {
                                        $('#upsell_' + data.itemId).attr('checked', 'checked');
                                }
                                
                                if (data.disabled == 1)
                                {
                                        $('#upsell_' + data.itemId).attr('disabled', 'disabled');
                                }
                                return input;
                        },
        
                        checkbox: function (div, name, id, selected, options) {
                                var tn = '', current_key = '', extra = null, rd = '', lbl = '', points = '', i = 1;
        
                                if ($('#cb_' + id).get(0) === undefined)
                                {
                                        $.create('ul', {'id': 'cb_' + id}).appendTo('#' + div);
                                }
                                
                                if(options == null){
                                         try{
                                                // IE - HACK
                                                rd = document.createElement('<input type="checkbox" name="' + name + '" id="' + id + '_1' + '" value="1" onclick="' + extra + '" />');
                                        }catch(err){
                                                rd = this.element({'element': this.element_input, 'type': this.element_input_type_checkbox, 'id': id + '_1','name': name, 'value': '1', 'extra': extra});
                                        }

                                        $("#cb_" + id).append(rd);

                                        if (selected == 1)
                                        {
                                                $('#' + id + '_1').attr('checked', 'checked');
                                        }
                                } 
                                else    
                                {
                                        for (key in options)
                                        {
                                                tn = $.create('textNode', {}, (typeof options[key] == 'object') ? options[key].name : options[key]);
                
                                                current_key = key;
                
                                                extra = null;
                
                                                if (options[key].extra)
                                                {
                                                        extra = options[key].extra;
                                                }
                
                                                try{
                                                        // IE - HACK
                                                        rd = document.createElement('<input type="checkbox" name="' + name + '" id="' + id + '_' + current_key + '" value="' + current_key + '" onclick="' + extra + '" />');
                                                }catch(err){
                                                        rd = this.element({'element': this.element_input, 'type': this.element_input_type_checkbox, 'id': id + '_' + current_key, 'name': name, 'value': current_key, 'extra': extra});
                                                }
                
                                                lbl = $.create('label', {'htmlFor': id + '_' + current_key, 'for': id + '_' + current_key});
                
                                                if (typeof($('#cb_' + id + '_' + current_key).get(0)) == 'undefined')
                                                {
                                                        $.create('li', {'id': 'cb_' + id + '_' + current_key}).appendTo("#cb_" + id).append($(lbl).append(rd).append($(tn)));
                                                }
                                                else {
                                                        $('#cb_' + id + '_' + current_key + ' *').remove();
                                                        $('#cb_' + id + '_' + current_key).append(rd).append($(lbl).append($(tn)));
                                                }
                
                                                if (selected !== null && selected.constructor == Array && jQuery.inArray(current_key,selected) != -1)
                                                {
                                                        $('#' + id + '_' + current_key).attr('checked', 'checked');
                                                }
                
                                                if (options[current_key].points && options[current_key].points.length != 0)
                                                {
                                                        points = options[current_key].points;
                
                                                        $.create('ul', {'id': 'points_' + id + '_' + current_key, 'name': 'points_' + id + '_' + current_key}).appendTo($(lbl));
                
                                                        for (key2 in points)
                                                        {
                                                                $.create('li', {'id': 'points_li_' + id + '_' + current_key + '_' + i}).appendTo('ul#points_' + id + '_' + current_key);
                                                                $('#points_li_' + id + '_' + current_key + '_' + i).html(points[key2]);
                                                                i++;
                                                        }
                                                }
                                        }
                                }
                        },
        
                        date: function (div, name, id, value, min, max) {
                                if (typeof(value) === 'Date')
                                        value = (value.getMonth()+1)+'/'+value.getDate()+'/'+value.getFullYear();
                                if (typeof(min) === 'string') {
                                        min = min.split('/');
                                        min = new Date(min[2],min[0]-1,min[1]);
                                }
                                if (typeof(max) === 'string') {
                                        max = max.split('/');
                                        max = new Date(max[2],max[0]-1,max[1]);
                                }
                                this.input_text(div, name, id, value, this.defaults.text.size, this.defaults.text.maxlength);
                                JUI.datepicker(); // Loads in the Javascript Files Needed to Support The Date Picker
        
                                function customRange(input) {
                                  return {
                                        minDate: (input.id == 'dTo' ? getDate($('#dFrom').val()) : null),
                                        maxDate: (input.id == 'dFrom' ? getDate($('#dTo').val()) : null)};
                                }
        
                                $(function() {
                                        $('#' + id).datepicker({
                                                numberOfMonths: 2,
                                                showButtonPanel: true,
                                                onClose: function(date) {
                                                        if (typeof KAANGO.ca == 'function')
                                                                KAANGO.ca.saveField($(this).attr('name'), date);
                                                },
                                                minDate: min,
                                                maxDate: max
                                        });
                                });
                        },
        
                        image: function (div, name, id, src) {
                                $('#' + div).append(this.element({'element': this.element_input, 'type': this.element_input_type_image, 'id': id, 'name': name, 'src': src}));
                        },
        
                        radio_only: function (name, id, value) {
                                try{
                                        // IE - HACK
                                        return document.createElement('<input type="radio" name="' + name + '" id="' + id + '" value="' + value + '" />');
                                }catch(err){
                                        return this.element({'element': this.element_input, 'type': this.element_input_type_radio, 'id': id, 'name': name, 'value': value});
                                }
                        },
        
                        radio: function (div, name, id, selected, options) {
                                var ul_id = 'ri_' + id;
        
                                $.create('ul', {'id': ul_id}).appendTo('#' + div);
        
                                for (key in options)
                                {
                                        var value = key,
                                                tn = $.create('span', {}, options[key]), h_i = [id, '_', key].join(''), lbl = $.create('label', {'htmlFor': h_i, 'for': h_i}), 
                                                rd = this.radio_only(name, h_i, value);
                                
                                        $.create('li').appendTo("#" + ul_id).append($(lbl).append(rd).append(tn));
                                        
                                        if (selected == value)
                                        {
                                                $('#' + h_i).attr('checked', 'checked');
                                        }
                                }
                        },
        
                        select: function (div, name, id, options, size, selected, multiple) {
        
                                var size = (multiple) ? 10 : size, new_select = this.element({'element': this.element_select, 'id': id, 'name': name, 'size': size});
        
                                this.add_multiple_options(new_select, options, selected);
                                
                                if (selected != null)
                                {
                                        $(new_select).selectOptions(selected);
                                }
        
                                $('#' + div).append(new_select);
        
                                if (multiple)
                                {
                                        $('#' + id).attr('multiple', 'multiple');
                                }
                        },
        
                        textarea: function (div, name, id, cols, rows, type, value, pixels) {
                                
                                if (pixels)
                                {
                                        $('#' + div).append(this.element({'element': this.element_textarea, 'id': id, 'rows': 20, 'cols': 20, 'name': name, 'value': value, 'class_name':'full'}));
                                        
                                        $('#' + id).css({'width': cols, 'height': rows});
                                }
                                else
                                {
                                        $('#' + div).append(this.element({'element': this.element_textarea, 'id': id, 'name': name, 'rows': rows, 'cols': cols, 'value': value, 'class_name':'full'}));
                                }
                        },
        
                        /*
                         * Creates the Actual HTML Element For the Page
                         * return this.element(this.element_input, type, name, id, value, size, maxlength, null, null, null);
                         *
                         * @param object html_form The JSON Object Containing the Form Setup and Content
                         *              html_form = {
                         *                      element = REQUIRED -- Setups the Element to Be a Input Tag or Textarea
                         *                      type = REQUIRED -- For the Input Tag to Setup the type of input expected
                         *                      name = REQUIRED -- The Name of the HTML Form Element
                         *                      id = REQUIRED -- The ID of the HTML Form Element
                         *                      value = The Value Pre-Populated
                         *                      size = The Size of the of the Input Box
                         *                      maxlength = The Max Length of Characters Allowd for Input
                         *                      rows = Used For Textarea to Define the Row Count
                         *                      cols = Used For Textarea to Define the Cols Count
                         *                      src = Used For Image Input Type
                         *                      extra = Extra Content to Bind to the HTML Form
                         *              }
                         */
                        element: function (html_form) {
                                var element_obj = {};
        
                                if (typeof(html_form['id']) === 'undefined')
                                {
                                        return false;
                                }
                                else
                                {
                                        element_obj.id = html_form['id'];
                                }
        
                                if (typeof(html_form['name']) === 'undefined')
                                {
                                        return false;
                                }
                                else
                                {
                                        element_obj.name = html_form['name'];
                                }
        
                                if (html_form['element'] == this.element_input)
                                {
                                        if (typeof(html_form['type']) === 'undefined')
                                        {
                                                return false;
                                        }
                                        else
                                        {
                                                element_obj.type = html_form['type'];
                                        }
                                        if (html_form['type'] == this.element_input_type_image)
                                        {
                                                if (typeof(html_form['src']) !== 'undefined' && html_form['src'] != null)
                                                {
                                                        element_obj.src = html_form['src'];
                                                }
                                                else
                                                {
                                                        return false;
                                                }
                                        }
        
                                        if (typeof(html_form['maxlength']) !== 'undefined')
                                        {
                                                element_obj.maxlength = html_form['maxlength'];
                                        }
                                        
                                        if (typeof(html_form['class_name']) !== 'undefined')
                                        {
                                                element_obj['class'] = html_form['class_name'];
                                        }
                                        
                                }
                                else if (html_form['element'] == this.element_textarea)
                                {
                                        if (typeof(html_form['cols']) === 'undefined')
                                        {
                                                return false;
                                        }
                                        else
                                        {
                                                element_obj.cols = html_form['cols'];
                                        }
        
                                        if (typeof(html_form['rows']) === 'undefined')
                                        {
                                                return false;
                                        }
                                        else
                                        {
                                                element_obj.rows = html_form['rows'];
                                        }
                                        
                                        if (typeof(html_form['class_name']) !== 'undefined')
                                        {
                                                element_obj['class'] = html_form['class_name'];
                                        }
                                }
        
                                if (typeof(html_form['size']) !== 'undefined' && html_form['size'] != 0)
                                {
                                        element_obj.size = html_form['size'];
                                }
        
                                if (typeof(html_form['value']) !== 'undefined' && html_form['value'] !== '' && html_form['value'] !== null )
                                {
                                        element_obj.value = html_form['value'];
                                }
        
                                if (typeof(html_form['extra']) !== 'undefined' && html_form['extra'] != null && typeof(html_form['extra']) != 'function')
                                {
                                        element_obj.onClick = html_form['extra'];
                                }
        
                                if (typeof(html_form['extra']) == 'function')
                                {
                                        return $.create(html_form['element'], element_obj).bind('click',html_form['extra']);
                                }
                                return $.create(html_form['element'], element_obj);
                        }
                }
                
        },

        validation: {

                /**
                 * Displays & positions errorsD
                 *
                 * @param obj opts An options object, currently only supports "top"
                 *              top: the position of the element's top relative to the bottom right corner of the element
                 */
                showErrors: function(opts) {
                        this.defaultShowErrors();
                        $.each(this.errorList,function(key) {
                                var element = $(this.element);
                                element.parents('.errorable').addClass('kng-createad-error').removeClass('check_error');
                                // must use $(this.element) instead of element b/c of tinyMCE
                                var error = $('#'+$(this.element).attr('name')+'_error');
                                var height = -47-(element.siblings('#'+error.attr('id')).length ? (element.outerHeight()-element.height())/2 + element.height() : 15);
                                var width = -25;
                                if($(element).attr('id')=='global_description') width = 458;
                                error.css({'top':height+'px','left':width+'px','padding':'1px 0 0'}).show();

                                if($('body .inerror').size() > 0)
                                {
                                        if($('html'))
                                        {
                                                $('html').animate({scrollTop:$('.kng-createad-error:first').offset().top - 50}, 400);
                                        }
                                        else
                                        {
                                                $('body').animate({scrollTop:$('.kng-createad-error:first').offset().top - 50}, 400);
                                        }
                                }
                        });
                        $('.kaangoError:has(label:not(:visible)):visible').hide().parents('.errorable').removeClass('kng-createad-error');
                },
                
                errorPlacement: function(error, element, container) {
                        var id = element.attr('name')+'_error',
                                i = $('map[name^="map"]').length,
                                parent;
                        if (error.html() != '')
                        {
                                var div = $.create('div',{'id':id,'style':'display:none','class':'kaangoError'})
                                        .append(error)
                                        .wrapInner('<div class="bubble_content"></div>')
                                        .wrapInner('<div class="bubble_br"></div>')
                                        .wrapInner('<div class="bubble_bl"></div>')
                                        .wrapInner('<div class="bubble_tr"></div>')
                                        .wrapInner('<div class="bubble_tl"></div>')
                                        .append('<div class="bubble_close_button">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>')
                                        .append('<div class="bubble_pointer"></div>');
                                        
                                var span = $.create('span',{'class':'errorWrapper','style':'position:relative;'});
                                
                                if(element.get(0).tagName=='SELECT' && $(element).attr('size')>2)
                                {
                                        element.parent().parent().after(span);
                                } else {
                                        element.after(span);
                                }
                                span.append(div);
                                
                                (function (elementToClick, errorDiv) {elementToClick.click(function() {errorDiv.hide();});})($('#'+id+' .bubble_close_button'),div);
                        }
                },
                
                invalidHandler: function(form, validator) {
                        $(form.currentTarget).addClass('validated')
                        if(validator.settings.focusInvalid){
                                $('html,body').queue(function () {
                                        //validator.focusInvalid();
                                        $(this).dequeue();
                                });
                        }
                        $('.errorable.errored').addClass('check_error');
                },
                
                success: function(label) {
                        $('#'+label.attr('for')+'_error').hide();
                        var errorable = $('*[name='+label.attr('for')+']').removeClass('error').parents('.errorable');
                        if (errorable.hasClass('check_error'))
                        {
                                errorable.removeClass('kng-createad-error check_error');
                        }
                        else if (errorable.hasClass('kng-createad-error'))
                        {
                                errorable.removeClass('kng-createad-error');
                        }
                },
                
                submitHandler: function() {
                        $("div.error").hide();
                        $('.errorable').removeClass('kng-createad-error');
                }
        },

        address: {
                setHashPath: function(hashPath)
                {
                        KAANGO.log('KAANGO.address.setHashPath: ' + hashPath);
                        var index = window.location.hash.indexOf('?'),
                                hashQuery = '';
                        if (index !== -1)
                        {
                                hashQuery = window.location.hash.substring(index);
                        }
                        $.address.value(KAANGO.address.anchor+hashPath+hashQuery);
                },
                setHashValue: function(setValues)
                {
                        var hash = window.location.hash.split("?"),
                                values = typeof hash[1] != 'undefined' ? hash[1].split("&") : [],
                                hashPath = hash[0].substring(1),
                                hashQuery = {},
                                hashArray = [];
                        for( var key in values)
                        {
                                var value = values[key].split("=");
                                if (value.length == 2)
                                {
                                        hashQuery[value[0]] = value[1];
                                }
                        }
                        for (var key in setValues)
                        {
                                if (setValues[key] !== '' && setValues[key] !== null)
                                {
                                        hashQuery[key] = setValues[key];
                                }
                        }
        
                        hash = $.param(hashQuery);
                        $.address.value(hashPath+(hash.length ? '?'+hash : ''));
                },
                setHashPathAndValue: function(hashPath,hashValues)
                {
                        var hash = window.location.hash.split("?"),
                                values = typeof hash[1] != 'undefined' ? hash[1].split("&") : [],
                                hashQuery = {},
                                hashArray = [];
                        for( var key in values)
                        {
                                var value = values[key].split("=");
                                if (value.length == 2)
                                {
                                        hashQuery[value[0]] = value[1];
                                }
                        }
                        for (var key in hashValues)
                        {
                                if (hashValues[key] !== '' && hashValues[key] !== null)
                                {
                                        hashQuery[key] = hashValues[key];
                                }
                        }

                        hash = $.param(hashQuery);
                        $.address.value(KAANGO.address.anchor+hashPath+(hash.length ? '?'+hash : ''));
                },
                lastVisited: '/',
                anchor: 'k'
        }
});

// Kaango Testing
// <?php Kaango_Test_JSTestLoader::printTests('tests/kaango-tests.js'); ?>


(function () {
        var jqueryAjax = $.ajax;
        $.ajax = function()
        {
                if (jQuery.inArray(arguments[0].url,$.ajax.kaango.exceptions) == -1)
                {
                        $.ajax.kaango.queue.push(arguments);
                        var complete = arguments[0].complete;
                        arguments[0].complete = function()
                        {
                                if (typeof(complete) == 'function')
                                {
                                        complete.apply(jqueryAjax,arguments);
                                }
                                $.ajax.kaango.queue.splice(0, 1);
                                if ($.ajax.kaango.queue.length == 0 && typeof($.ajax.kaango.callback.fn) == 'function')
                                {
                                        $.ajax.kaango.call($.ajax.kaango.callback.callee,$.ajax.kaango.callback.arguments,$.ajax.kaango.callback.fn);
                                }
                        }
                }
            if(arguments[0])
                {
                        if(arguments[0].data)
                        {
                                if(typeof(arguments[0].data) == 'string')
                                {
                                        arguments[0].data += '&adCartId=' + KAANGO.adcart;
                                } 
                                else
                                {
                                        arguments[0].data.adCartId = KAANGO.adcart;
                                }
                        }
                        else
                        {
                                arguments[0].data = {adCartId: KAANGO.adcart};
                        }
                }
                return jqueryAjax.apply($,arguments);
        };
        $.ajax.kaango = {};
        $.ajax.kaango.exceptions = [];
        $.ajax.kaango.queue = [];
        $.ajax.kaango.callback = {};
        $.ajax.kaango.call = function(parent,args,funct)
        {
                $.ajax.kaango.callback = {};
                funct.apply(parent,args);
        };
        $.ajax.kaango.enqueue = function(parent,args,funct)
        {
                $.ajax.kaango.callback = {callee: parent,arguments: args, fn: funct};
                if ($.ajax.kaango.queue.length == 0)
                {
                        $.ajax.kaango.call($.ajax.kaango.callback.callee,$.ajax.kaango.callback.arguments,$.ajax.kaango.callback.fn);
                }
        };
        $.ajax.kaango.addException = function(url)
        {
                if (jQuery.inArray(url,$.ajax.kaango.exceptions) == -1)
                {
                        $.ajax.kaango.exceptions.push(url);
                }
        };
        $.ajax.kaango.removeException = function(url)
        {
                var index = jQuery.inArray(url,$.ajax.kaango.exceptions);
                if (index !== -1)
                {
                        $.ajax.kaango.exceptions.splice(index, 1);
                }
        };
})();
