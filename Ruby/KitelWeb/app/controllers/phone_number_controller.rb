class PhoneNumberController < ApplicationController
  def index
    @conditions = "id not in (select phonenumber_id from services)"
    if params[:area_code] != nil
      @conditions += " and area_code='#{params[:area_code]}'"
    end

    @phone_numbers = PhoneNumber.all(:select => "id, number, area_code",
                                     :conditions => @conditions,
                                     :limit => params[:count])

    respond_to do |format|
      format.xml # show_area_codes.xml.builder
    end
  end

  def show_area_codes
    @area_codes = PhoneNumber.all(:select => 'distinct(area_code)')
    respond_to do |format|
      format.xml # show_area_codes.xml.builder
    end
  end

  def not_supported
    render :status => 405
  end
end

