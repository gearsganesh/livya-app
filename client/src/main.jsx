import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter,useNavigate} from "react-router-dom";
import {createClient} from "@supabase/supabase-js";
import "./styles.css";

const url=import.meta.env.VITE_SUPABASE_URL||"https://ekyvogemusxmgeefrqmc.supabase.co";
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||"";
export const supabase=createClient(url,key);

const nav=[["home","⌂","Home"],["health","♥","Health"],["records","▣","Records"],["programmes","◈","Programmes"],["schedule","◷","Schedule"],["profile","●","Profile"]];
const cards=[["Metabolic health","78","Good","Your current metabolic score"],["Blood glucose","6.4","mmol/L","Latest reading"],["Weight","72.8","kg","7-day trend"],["Hydration","1.2","L","Today"]];

function App(){
 const [session,setSession]=useState(null); const [page,setPage]=useState("home"); const [loading,setLoading]=useState(true);
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)}); const {data}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return()=>data.subscription.unsubscribe()},[]);
 if(loading)return <Splash/>;
 if(!session)return <Login/>;
 return <Shell page={page} setPage={setPage} session={session}/>;
}
function Splash(){return <div className="splash"><div className="brand">LIVYA</div><span>Smart metabolic health</span></div>}
function Login(){
 const [mode,setMode]=useState("login"),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[name,setName]=useState(""),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 async function submit(e){e.preventDefault();setBusy(true);setMsg("");let r=mode==="login"?await supabase.auth.signInWithPassword({email,password}):await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});setBusy(false);if(r.error)setMsg(r.error.message);else if(mode==="signup")setMsg("Account created. Check your email if confirmation is enabled.");}
 return <div className="auth"><div className="auth-card"><div className="logo">LIVYA</div><p className="muted">Your personalised metabolic health companion.</p>{mode==="signup"&&<input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)}/>}<input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>{msg&&<div className="notice">{msg}</div>}<button className="primary" onClick={submit} disabled={busy}>{busy?"Please wait…":mode==="login"?"Sign in":"Create account"}</button><button className="linkbtn" onClick={()=>setMode(mode==="login"?"signup":"login")}>{mode==="login"?"Create a new account":"Back to sign in"}</button></div></div>
}
function Shell({page,setPage,session}){
 const [profile,setProfile]=useState(null);
 useEffect(()=>{supabase.from("profiles").select("*").eq("id",session.user.id).maybeSingle().then(({data})=>setProfile(data))},[session]);
 return <div className="app"><header><div className="topbrand">LIVYA</div><button className="avatar" onClick={()=>setPage("profile")}>{(profile?.full_name||session.user.email||"U")[0].toUpperCase()}</button></header><main><div className="page-title"><div><span className="eyebrow">LIVYA SMART HEALTH</span><h1>{pageTitle(page)}</h1></div><span className="status">● Connected</span></div>{page==="home"?<Home profile={profile}/>:page==="health"?<Health/>:page==="records"?<Records/>:page==="programmes"?<Programmes/>:page==="schedule"?<Schedule/>:<Profile session={session} profile={profile}/>}</main><nav className="bottomnav">{nav.map(([id,ic,label])=><button className={page===id?"active":""} onClick={()=>setPage(id)} key={id}><b>{ic}</b><span>{label}</span></button>)}</nav></div>
}
const pageTitle=p=>({home:"Good morning",health:"Health",records:"Health records",programmes:"Programmes",schedule:"Schedule",profile:"Profile"}[p]||"LIVYA");
function Home({profile}){return <><section className="hero"><div><span>Welcome back</span><h2>{profile?.full_name||"Member"}</h2><p>Here's your health picture today.</p></div><div className="score"><strong>78</strong><small>score</small></div></section><div className="grid">{cards.map(c=><article className="metric" key={c[0]}><span>{c[0]}</span><strong>{c[1]} <small>{c[2]}</small></strong><p>{c[3]}</p></article>)}</div><section className="panel"><div className="panelhead"><h3>Today's actions</h3><span>View all</span></div>{["Morning glucose reading","Drink 500 ml water","Take prescribed medication","Complete 20 minute walk"].map((x,i)=><div className="row" key={x}><i className={i<1?"done":""}>✓</i><div><b>{x}</b><small>{i<1?"Completed":"Due today"}</small></div><button>›</button></div>)}</section></>}
function Health(){return <><div className="healthhero"><span>Metabolic score</span><strong>78</strong><em>Good</em><p>Based on your latest readings and programme activity.</p></div><div className="grid">{cards.map(c=><article className="metric" key={c[0]}><span>{c[0]}</span><strong>{c[1]} <small>{c[2]}</small></strong><p>{c[3]}</p></article>)}</div><section className="panel"><h3>Smart analysis</h3><p className="muted">Your recent measurements are available to your care team. Trends and recommendations are updated when new records are added.</p></section></>}
function Records(){return <section className="panel">{["Blood test report","HbA1c","Fasting glucose","Lipid profile","Weight record"].map((x,i)=><div className="record" key={x}><div className="recordicon">▣</div><div><b>{x}</b><small>{i===0?"Uploaded recently":"Latest result"}</small></div><span>›</span></div>)}</section>}
function Programmes(){return <div className="cards">{["Metabolic Reset","Nutrition programme","Movement & fitness","Sleep optimisation"].map((x,i)=><article className="programme" key={x}><span>PROGRAMME {i+1}</span><h3>{x}</h3><p>{i===0?"Your personalised metabolic health journey.":"Guided support from the LIVYA care team."}</p><button className="outline">Open programme</button></article>)}</div>}
function Schedule(){return <section className="panel"><div className="panelhead"><h3>Upcoming</h3><button className="smallbtn">+ Book</button></div>{["Nutrition consultation","Doctor follow-up","Health review","Lab test"].map((x,i)=><div className="appointment" key={x}><div className="date"><b>{12+i}</b><small>SEP</small></div><div><b>{x}</b><small>{10+i}:00 AM · LIVYA Care Team</small></div><span>›</span></div>)}</section>}
function Profile({session,profile}){return <section className="panel profile"><div className="profilehead"><div className="bigavatar">{(profile?.full_name||session.user.email||"U")[0].toUpperCase()}</div><h2>{profile?.full_name||"Member"}</h2><p>{session.user.email}</p></div>{["Personal details","Notifications","Connected devices","Language","Privacy & security"].map(x=><div className="record" key={x}><div><b>{x}</b><small>Manage your preferences</small></div><span>›</span></div>)}<button className="danger" onClick={()=>supabase.auth.signOut()}>Sign out</button></section>}
createRoot(document.getElementById("root")).render(<BrowserRouter><App/></BrowserRouter>);