/* Dekho bahopt shochne ki jarrorat nhi hai isme bs function ke andar ek function bna hua hai
 jo ki Promise.resolve ka use karta hai jiska mtlbe ye hai agar function nhi chala to o error 
 ko next() aage kisi middleware ko transfer kar dega */

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };


const asyncHandle = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  }
}
