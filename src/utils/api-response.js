// This class helps the app to give standard response to client.
// whenever we need to response just import this class and use it .


// Bhai 100 ki sidhi ek baat ye ek class hai jiska use karke hum aage responses ko share karenge.

class ApiResponse {
  constructor(Statuscode, data, message = "success") {
    this.Statuscode = Statuscode;
    this.data = data;
    this.message = message;
    this.success = Statuscode < 400;
  }
}

export { ApiResponse };