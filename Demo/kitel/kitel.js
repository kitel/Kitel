// Add a form with the following IDs
// kttl_tmp_phone_form
// |-kttl_tmp_phone_area_codes_cntr
//   |-kttl_use_tmp_phone
// |-kttl_tmp_phone_area_codes
// |-kttl_tmp_phone_numbers
// |-kttl_tmp_phone_usr_area_code
// |-kttl_tmp_phone_usr_phone_number
 
var dd_area_codes_default_val = "Please Choose Area Code"
var dd_numbers_default_val = "Please Choose Your Number"
	
 //__KTTL_QUERY object_________________________________________________________
 function o_kttl_query(target_uri)
 {
 	//__Attributes
 	this.account_number = ""
 	this.user_number=""
 	this.target_uri = target_uri
	this.jsonp_callBack = "callback=?"
 	this.executed = false
 	
 	//__Reset data
 	this.reset = function() {
 								this.executed = false
								this.account_number = ""
								this.user_number = ""
							}
	
	//__Setters/Getters
	this.set_executed = function() {
								this.executed = true
							}							
	this.set_account_number = function(data) {
								this.account_number = data
							}
	this.set_user_number = function(data) {
								this.user_number = data
							}
							
	this.get_executed = function() {
								return this.executed
							}
	this.get_account_number = function() {
								return this.account_number
							}
	this.get_user_number = function() {
								return this.user_number
							}
							
	//__Requests
 	this.rq_area_codes = function() {
								return this.target_uri + "/area_codes.jsonp?" + this.jsonp_callBack;
							}
 	this.rq_numbers = function(area_code) {
								return this.target_uri + "/configuration/numbers_list.jsonp?area_code=" + area_code + "&" + this.jsonp_callBack;
							}
 	this.rq_account = function() {
								return this.target_uri + "/service/create.jsonp?account_number=" + 
								this.account_number + "&user_number=" + this.user_number + "&service_period=3&" + this.jsonp_callBack;
							}
 };
 
 function kttl_reset()
 {
	$("#kttl_tmp_phone_area_codes_cntr").hide()
	$("#kttl_tmp_phone_numbers_cntr").hide()
	$("#kttl_tmp_phone_usr_cntr").hide()
   
	kttl_dd_area_codes_reset()
	kttl_dd_numbers_reset()
 };
 
 function kttl_disable()
 {
	$("#kttl_tmp_phone_area_codes").attr("disabled", "disabled");
	$("#kttl_tmp_phone_numbers").attr("disabled", "disabled");
	$("#kttl_tmp_phone_usr_area_code").attr("disabled", "disabled");
	$("#kttl_tmp_phone_usr_phone_number").attr("disabled", "disabled");
	$("#kttl_use_tmp_phone").attr("disabled", "disabled");
 };
 

 function kttl_dd_area_codes_reset()
 {
   $("#kttl_tmp_phone_area_codes").empty()
   $('<option>').text( dd_area_codes_default_val ).appendTo( $("#kttl_tmp_phone_area_codes") ) 
 };
 
 function kttl_dd_numbers_reset()
 {
   $("#kttl_tmp_phone_numbers").empty()
   $('<option>').text( dd_numbers_default_val ).appendTo( $("#kttl_tmp_phone_numbers") )
   kttl_query.set_account_number("")
 };
 
 //____________________________________________________________________________
 $(document).ready(
 function()
 {
 	kttl_query = new o_kttl_query("http://76.21.115.110");

 	$("#kttl_use_tmp_phone").attr(":checked", false)
 	kttl_reset()
	kttl_query.reset()
	
	$("#kttl_use_tmp_phone").change(function()
	{
		var use_tmp_phone = $("#kttl_use_tmp_phone").is(":checked")
		$("#kttl_tmp_phone_area_codes_cntr").toggle( use_tmp_phone )
		if(use_tmp_phone)
		{
			var area_codes_data
			//Read area codes
			$.ajax
			({
				url: kttl_query.rq_area_codes(),
				type: "GET",
				dataType: "jsonp",
				success: function(data)
				{
					//Fill area codes drop down box
					area_codes_data = data;
					var area_codes_ctrl_data = $("#kttl_tmp_phone_area_codes")
					
					$.each(area_codes_data, function(i, area_code_item){
							$('<option>').text(area_code_item.area_code).appendTo(area_codes_ctrl_data)
						})
				},
				error: function (xhr, options, error)
				{
                    alert( "ERROR:" + xhr.status + ":" + error)
                }    
			})
		}
		else
		{
			kttl_reset()
			kttl_query.reset()
		}
	});

	$("#kttl_tmp_phone_area_codes").change(function()
	{
		var area_code_value = $(this).val()
	
		$.ajax
		({
			url: kttl_query.rq_numbers(area_code_value),
			type: "GET",
			dataType: "jsonp",
			success: function(data)
			{
				//Show numbers control
				$("#kttl_tmp_phone_numbers_cntr").show()
				kttl_dd_numbers_reset()

				//Fill numbers control
				numbers_data = data;
				var numbers_ctrl_data = $("#kttl_tmp_phone_numbers")
				
				$.each(numbers_data, function(i, number_item){
						$('<option>').text(number_item.number).appendTo(numbers_ctrl_data)
					})
			},
			error: function (xhr, options, error)
			{
                   alert( "ERROR:" + xhr.status + ":" + error)
            }    
		});
			
	});

	$("#kttl_tmp_phone_numbers").change(function()
	{
		kttl_query.set_account_number( $(this).val() )
		//Show usr area & phone control
		$("#kttl_tmp_phone_usr_cntr").show()
	});

	$("#kttl_tmp_phone_form").ready(
		function()
		{
			kttl_reset();
		}
	);
 });

 function kttl_submit_data()
 {
	if(!kttl_query.get_executed())
	{
		var area_code_value = $("#kttl_tmp_phone_usr_area_code").val();
		var area_number_value = $("#kttl_tmp_phone_usr_phone_number").val();
	
	
		if(area_code_value.length < 3 || area_number_value.length < 7)
			{
				alert("Error: Please Input proper user number");
				return;
			}
		  
		kttl_query.set_user_number( "+1" + area_code_value + area_number_value )
		
		$.ajax
		({
			url: kttl_query.rq_account(),
			type: "GET",
			dataType: "jsonp",
			success: function(data)
			{
	        	alert( "Your phone registered: account number[" + 
	        			kttl_query.get_account_number() + "] user number[" + kttl_query.get_user_number() + "]")
	        	kttl_query.set_executed()
	        	kttl_disable()	
			},
			error: function (xhr, options, error)
			{
	        	alert( "ERROR:" + xhr.status + ":" + error)
	        }    
		});
	}
 }