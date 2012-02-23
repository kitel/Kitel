class ServiceController < ApplicationController
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
end
