module.exports = (req, res, next) =>{
  if(req.session.islogined&&req.session.cid != undefined)
    next();
  else 
    {req.session.cid = 1; next()}
    // res.status(401).send('not logined');
}
