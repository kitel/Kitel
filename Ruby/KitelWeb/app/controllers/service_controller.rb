class ServiceController < ApplicationController
  def index
  end

  def show
  end

  def create
    begin
     @phone_number = PhoneNumber.find_by_number!(params[:account_number])
    rescue ActiveRecord::RecordNotFound
      @status = 400
      @error_description = "#{@status} - Phone number not found"
      render :status => @status
      return
    end

    begin
      @service = Service.create( :phonenumber_id => @phone_number.id,
                                 :start_date => Date.today,
                                 :user_phone_number => params[:user_number],
                                 :service_period => params[:service_period])
      @service.save()
    rescue Exception
      @status = 400
      @error_description = $! #ToDo: this is for debug purposes only, might be unsafe on PRO
      render :status => @status
      return
    end

    @status = 201
    render :status => @status
  end

  def update
  end

  def destroy
  end

end
