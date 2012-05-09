xml.instruct!
    xml.Response do
        #xml.Dial @phone_number
        xml.Say "Powered by Kitel"
        xml.Dial(@user_phone_number, "callerId" => @from_phone_number)
    end

