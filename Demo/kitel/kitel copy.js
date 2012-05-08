// Add a form with the following IDs
// kttl_tmp_phone_form
// |-kttl_tmp_phone_area_codes_cntr
//   |-kttl_use_tmp_phone
// |-kttl_tmp_phone_area_codes
// |-kttl_tmp_phone_numbers
// |-kttl_tmp_phone_usr_area_code
// |-kttl_tmp_phone_usr_phone_number
 function kttl_reset()
 {
   $("#kttl_tmp_phone_area_codes_cntr").toggle(false);
   $("#kttl_tmp_phone_numbers_cntr").toggle(false);
   $("#kttl_tmp_phone_usr_cntr").toggle(false);
 };
 
 $(document).ready(
 function()
 {
	$("#kttl_use_tmp_phone").change(function()
	{
		var use_tmp_phone = $("#kttl_use_tmp_phone").is(":checked");
		$("#kttl_tmp_phone_area_codes_cntr").toggle( use_tmp_phone );
		if(use_tmp_phone)
		{
			var area_codes_data;
			//Read area codes
			$.ajax
			({
				url: "area_codes.xml",
				type: "GET",
				dataType: "xml",
				success: function(data)
				{
					//Fill area codes drop down box
					area_codes_data = data;
					var area_codes_ctrl_data = $("#kttl_tmp_phone_area_codes");
			        $('code', area_codes_data).each( function() 
			        { 
			        	$('<option>').text( $(this).text() ).appendTo(area_codes_ctrl_data);
			        });
				},
				error: function (xhr, options, error)
				{
                    alert(xhr.status + ":" + error);
                }    
			});
		}
		else
		{
			kttl_reset();
		}
	});

	$("#kttl_tmp_phone_area_codes").change(function()
	{
		var area_code_value = $(this).val();
		alert(area_code_value);
			
	    var numbers_data;			
		$.ajax
		({
			url: "numbers.xml",
			type: "GET",
			dataType: "xml",
			success: function(data)
			{
				//Show numbers control
				$("#kttl_tmp_phone_numbers_cntr").toggle( true );

				//Fill numbers control
				numbers_data = data;
				var numbers_ctrl_data = $("#kttl_tmp_phone_numbers");
		        $('number', numbers_data).each( function() 
		        { 
		        	$('<option>').text( $(this).text() ).appendTo(numbers_ctrl_data);
		        });
			},
			error: function (xhr, options, error)
			{
                alert(xhr.status + ":" + error);
            }    
		});
			
	});

	$("#kttl_tmp_phone_numbers").change(function()
	{
		//Show usr area & phone control
		$("#kttl_tmp_phone_usr_cntr").toggle( true );
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
	var area_code_value = $("#kttl_tmp_phone_usr_area_code").val();
	var area_number_value = $("#kttl_tmp_phone_usr_phone_number").val();
	var finalRequestString = "user data code:" + area_code_value + "number:" + area_number_value;
	alert( finalRequestString );
 }