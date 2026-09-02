const {json,rumah}=require("./_lib");
module.exports=async(req,res)=>{
  try{return json(res,200,await rumah("v2/services"))}
  catch(e){return json(res,502,{success:false,error:{message:e.message}})}
};
