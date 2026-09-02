const {supabase,json,auth}=require("./_lib");
module.exports=async(req,res)=>{
  try{
    const a=auth(req);
    const {data,error}=await supabase.from("users").select("id,username,email,balance,created_at").eq("id",a.sub).single();
    if(error) throw error;
    return json(res,200,{success:true,data});
  }catch(e){return json(res,401,{success:false,error:{message:e.message==="UNAUTHORIZED"?"Unauthorized":e.message}})}
};
