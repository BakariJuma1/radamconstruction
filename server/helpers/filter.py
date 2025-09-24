
def filter_bookings(service_dict, current_user_email):
    if current_user_email:
        service_dict["bookings"] = [
            b for b in service_dict["bookings"] if b["email"] == current_user_email
        ]
    else:
        service_dict["bookings"] = []
    return service_dict