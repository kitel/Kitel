class PhoneNumberController < ApplicationController
  def index
    if params[:area_code] == nil
      @phone_numbers = PhoneNumber.find(:all, :limit => params[:count])
    else
      @phone_numbers = PhoneNumber.find_all_by_area_code(params[:area_code], :limit => params[:count])
    end

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
