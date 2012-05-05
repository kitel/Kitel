class PhoneNumberController < ApplicationController

  def index
    @conditions = 'id not in (select phonenumber_id from services)'
    if params[:area_code] != nil
      @conditions += " and area_code='#{params[:area_code]}'"
    end

    @phone_numbers = PhoneNumber.all(:select => "id, number, area_code",
                                     :conditions => @conditions,
                                     :limit => params[:count])

    respond_to do |format|
      format.xml # index.xml.builder
      format.json # index.json.erb
    end
  end

  def show_area_codes
    @conditions = "id not in (select phonenumber_id from services)"
    @area_codes = PhoneNumber.all(:select => 'distinct(area_code)',
                                  :conditions => 'id not in (select phonenumber_id from services)')
    respond_to do |format|
      format.xml # show_area_codes.xml.builder
      format.json # show_area_codes.json.erb
    end
  end

  def not_supported
    render :status => 405
  end
end

