const {json,rumah}=require("./_lib");
module.exports=async(req,res)=>{
  try{
    const service_id=req.query.service_id;
    if(!service_id) throw new Error("service_id wajib.");
    return json(res,200,await rumah(`v2/countries?service_id=${encodeURIComponent(service_id)}`));
  }catch(e){return json(res,400,{success:false,error:{message:e.message}})}
};
