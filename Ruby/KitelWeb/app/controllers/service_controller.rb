class ServiceController < ApplicationController
  require 'rubygems'
  require 'twilio-ruby'

  def index
  end

  def show
  end

  def create
    begin
     # first we need to parse the phone number; US number in E.164 with or without + assumed for now
     if !params[:account_number].gsub(/\D/, "").match(/^\+?1(\d{3})(\d+)/)
      return renderError(400, "Wrong phone number format")
     end

     @phone_number = PhoneNumber.find_by_area_code_and_number!($1, $2)
    rescue ActiveRecord::RecordNotFound
      return renderError(400, "Phone number not found")
    end

    begin
      @service = Service.create( :phonenumber_id => @phone_number.id,
                                 :start_date => Date.today,
                                 :user_phone_number => params[:user_number],
                                 :service_period => params[:service_period])
      @service.save()
    rescue Exception
      return renderError(400, $!) #ToDo: $! is for debug purposes only, might be unsafe on PRO
    end

    @status = 201
    render :status => @status
  end

  def update
  end

  def destroy
  end

  def renderError(status, error_description)
    @status = status
    @error_description = "#{status} - " + error_description.to_s
    render :status => @status
  end

  #twilio integration demo
  def redirect
    # first we need to parse the phone number; US number in E.164 with or without + assumed for now
    if !params['From'] ||  params['From']==''
      params['From'] = '+14084209186'
    end

    @from_phone_number =  params['From']

    if !params['Called'] ||  params['Called']==''
      params['Called'] = '+14084209186'
    end

    if !params['Called'].gsub(/\D/, "").match(/^\+?1(\d{3})(\d+)/)
      return renderError(400, "Wrong phone number format")
    end

    @phone_number = PhoneNumber.find_by_area_code_and_number!($1, $2)

    begin
      @service = Service.find_by_phonenumber_id(@phone_number.id)
      @user_phone_number = @service.user_phone_number
    rescue ActiveRecord::RecordNotFound
      return renderError(400, "Service not found")
    end

    render :action => "redirect.xml.builder", :layout => false
  end
end