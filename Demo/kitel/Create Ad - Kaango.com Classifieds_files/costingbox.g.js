var CostingBox = {
	addCostLine: function(upsellType,upsellTitle,upsellPrice,total,display_free)
	{
		var item = '';

		if (upsellPrice instanceof Date || (/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/).test(upsellPrice))
		{
			if (upsellPrice instanceof Date === false)
			{
				var date_parts = upsellPrice.split('-');
				upsellPrice = new Date(date_parts[0], parseInt(date_parts[1], 10) - 1, date_parts[2]);
				delete date_parts;
			}
			
			item = dateFormat(upsellPrice, dateFormat.masks.mediumDate);
		}
		else if (display_free == 3)
		{
			item = parseInt(upsellPrice, 10);
		}
		else if (display_free == 2)
		{
            // pre-paid credits covered the balance of the ad
			item = 'Credit';
		}
		else if (display_free == 0)
		{
			// This Currently Returns Either a Number with a Dollar Sign
			item = '$ ' + upsellPrice;
		}
		else if (isNaN(parseFloat(upsellPrice)))
		{
			item = upsellPrice;
		}
		else
		{
            if(upsellPrice.indexOf(' ') != -1) {
			    item = upsellPrice;
            } else {
                // This Currently Returns Either a Number with a Dollar Sign or FREE
                item = KAANGO.util.monetize(upsellPrice);
            }
		}

		if (upsellTitle != null)
		{
			if (total === true)
			{
                list = $.create('li', {'class': 'costing-box-line-item-total'})
							.append($.create('span', {'class': 'kng-text-light-green kng-width-66 kng-bold-text'}, upsellTitle + ':'))
                            .append($.create('span', {'class': 'kng-text-light-green kng-width-33 kng-align-right'}, item));
			}
			else
			{
				list = $.create('li', {'class': 'costing-box-line-item'})
							.append($.create('span', {'class': 'kng-width-66 kng-bold-text'}, upsellTitle + ':'))
                            .append($.create('span', {'class': 'kng-width-33 kng-align-right', 'id': upsellTitle.replace(/[\W^-]+/, "")}, item));
			}
			
			$('#' + upsellType).append(list);
		}
	},

	addCostSection: function (id)
	{
		$('#costingBox').append($.create('ul', {'id' : id, 'class' : 'kng-two-column kng-add-bottom-border-with-padding'}));
	},
	
	highlight: function ()
	{
		$("#pricing_box_full .summary_content_box").effect("highlight", {}, 750);
	},
  
	buildFromOrder: function(order)
	{
		this.startAlteration();
		this.clearAll();
		
		for (var order_key in order)
		{
			var order_section = order[order_key];
			this.addCostSection(order_key);
			
			for (var sec_key in order_section)
			{
				var total_line = (order_section[sec_key]['bold'] == 1);
				
				this.addCostLine(order_key, order_section[sec_key]['name'], order_section[sec_key]['value'], total_line, order_section[sec_key]['d_free']);
			}
		}
		
		delete order_section;
		
		this.endAlteration();
	},

	clearAll: function()
	{
		/* clear costingBox for rebuilding. */
		$('#costingBox').empty();
	},

	startAlteration: function()
	{
		$('#costingBox').hide();
		$('#costingUpdate').show();
	},

	endAlteration: function()
	{
		$('#costingBox').show();
		$('#costingUpdate').hide();
	},

	initAnimation: function() {
        offsetTop = $('#kng-content-wrapper').offset().top + 10;

        $(window).scroll(function() {
            if ($(window).scrollTop() > offsetTop)
            {
                $('#kng-create-ad-sidebar').css('position', 'fixed').css('top', '20px');
            }
            else
            {
                $('#kng-create-ad-sidebar').css('position', 'relative').css('top', '');
            }

        });
	}
};