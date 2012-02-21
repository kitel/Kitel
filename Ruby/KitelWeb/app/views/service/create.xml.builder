xml.instruct!
  if @status != 201
    xml.error do
        xml.description @error_description
    end
  else
    xml.service do
      xml.service_id @service.id
      xml.account_number @service.PhoneNumber.number
      xml.user_number @service.user_phone_number
      xml.start_time @service.start_date
      xml.service_period @service.service_period
    end
  end