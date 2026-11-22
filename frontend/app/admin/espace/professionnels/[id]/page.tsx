"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { apiFetch, getApiUrl } from "@/lib/api";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

type Service={_id?:string;name:string;duration:number;price:number;currency?:string};
type Doc={_id?:string;name:string;url:string;mimeType:string;size:number};
type P={_id:string;displayName:string;city:string;address?:string;phone?:string;status:string;isVisible?:boolean;rejectionReason?:string;description?:string;licenseNumber?:string;profession?:{name:string};user?:{firstName:string;lastName:string;email:string;phone?:string;status?:string};services?:Service[];documents?:Doc[]};

type EffectiveState = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";
function effectiveState(p: P): EffectiveState {
  if (p.status === "PENDING") return "PENDING";
  if (p.status === "REJECTED") return "REJECTED";
  if (p.user?.status === "SUSPENDED" || p.isVisible === false) return "SUSPENDED";
  return "ACTIVE";
}
const stateLabels: Record<EffectiveState, string> = {
  PENDING: "En attente de validation",
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
  REJECTED: "Refusé",
};

type PendingAction = { kind: "REJECT" | "SUSPEND" | "REACTIVATE" | "DELETE" } | null;

export default function AdminProfessionalDetailsPage(){
 const {user,accessToken}=useAuth(); const params=useParams(); const id=String(params.id); const [p,setP]=useState<P|null>(null); const [error,setError]=useState(""); const [pendingAction,setPendingAction]=useState<PendingAction>(null); const [busy,setBusy]=useState(false);

 const load = () => void apiFetch<P>(`/admin/agents/${id}`,{token:accessToken??undefined}).then(setP).catch(e=>setError(e instanceof Error?e.message:"Professionnel introuvable."));

 useEffect(()=>{if(user?.role!=="ADMIN"||!id)return; load();},[id,user,accessToken]);
 if(!user||user.role!=="ADMIN")return <main className="min-h-screen p-10 text-center">Accès refusé</main>;
 if(!p)return <main className="min-h-screen p-10 text-center">{error||"Chargement..."}</main>;

 const approve=async()=>{setBusy(true);setError("");try{await apiFetch(`/admin/agents/${p._id}/validate`,{method:"PATCH",token:accessToken??undefined,body:JSON.stringify({action:"APPROVE"})});load();}catch(e){setError(e instanceof Error?e.message:"Action impossible.");}finally{setBusy(false);}};

 const runPendingAction=async()=>{
  if(!pendingAction)return; setBusy(true); setError("");
  try{
   if(pendingAction.kind==="REJECT"){
    await apiFetch(`/admin/agents/${p._id}/validate`,{method:"PATCH",token:accessToken??undefined,body:JSON.stringify({action:"REJECT",reason:"Dossier rejeté par l'administrateur."})});
   } else if(pendingAction.kind==="SUSPEND"){
    await apiFetch(`/admin/agents/${p._id}/suspend`,{method:"PATCH",token:accessToken??undefined});
   } else if(pendingAction.kind==="REACTIVATE"){
    await apiFetch(`/admin/agents/${p._id}/reactivate`,{method:"PATCH",token:accessToken??undefined});
   } else if(pendingAction.kind==="DELETE"){
    await apiFetch(`/admin/agents/${p._id}`,{method:"DELETE",token:accessToken??undefined});
   }
   setPendingAction(null);
   if(pendingAction.kind==="DELETE"){window.location.href="/admin/espace/agent";return;}
   load();
  }catch(e){setError(e instanceof Error?e.message:"Action impossible.");}finally{setBusy(false);}
 };

 const state = effectiveState(p);
 const confirmCopy: Record<NonNullable<PendingAction>["kind"], {titre:string;message:string;label:string}> = {
  REJECT:{titre:"Rejeter cette fiche ?",message:"L'agent ne sera pas visible sur la plateforme. Ce refus pourra être annulé plus tard.",label:"Rejeter"},
  SUSPEND:{titre:"Suspendre cet agent ?",message:"Son compte et sa fiche seront masqués de la plateforme jusqu'à réactivation.",label:"Suspendre"},
  REACTIVATE:{titre:"Réactiver cet agent ?",message:"L'agent redeviendra actif et visible sur la plateforme.",label:"Réactiver"},
  DELETE:{titre:"Supprimer définitivement cette fiche ?",message:"Cette action est irréversible.",label:"Supprimer"},
 };

 return <main className="min-h-screen backdrop-blur-sm p-10 rounded-3xl px-4 py-12"><div className="mx-auto max-w-5xl"><Link href="/admin/espace/agent" className="text-sm text-gray-600">← Retour à la gestion des agents</Link><div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm text-gray-500">{p.profession?.name??"Profession"}</p><h1 className="mt-1 text-3xl font-bold text-gray-900">{p.displayName}</h1><p className="mt-2 text-gray-500">{p.city} · {p.user?.email}</p>{state==="REJECTED"&&p.rejectionReason&&<p className="mt-2 text-sm text-red-600">Motif : {p.rejectionReason}</p>}</div><span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium">{stateLabels[state]}</span></div><div className="mt-8 grid gap-6 sm:grid-cols-2"><div><h2 className="font-semibold text-gray-900">Informations professionnelles</h2><p className="mt-3 text-sm text-gray-600">Licence : <strong className="text-gray-900">{p.licenseNumber||"Non renseignée"}</strong></p><p className="mt-2 text-sm text-gray-600">Téléphone : {p.phone||p.user?.phone||"Non renseigné"}</p><p className="mt-2 text-sm text-gray-600">Adresse : {p.address||"Non renseignée"}</p></div><div><h2 className="font-semibold text-gray-900">Description</h2><p className="mt-3 text-sm leading-6 text-gray-600">{p.description||"Aucune description renseignée."}</p></div></div><section className="mt-8 border-t border-gray-100 pt-6"><h2 className="text-lg font-semibold">Services et tarifs</h2>{p.services?.length?<div className="mt-4 space-y-3">{p.services.map((s,i)=><div key={s._id??i} className="flex justify-between rounded-xl border p-4"><span>{s.name} · {s.duration} min</span><strong>{s.price} {s.currency??"DT"}</strong></div>)}</div>:<p className="mt-3 text-sm text-gray-500">Aucun service enregistré.</p>}</section><section className="mt-8 border-t border-gray-100 pt-6"><h2 className="text-lg font-semibold">Documents justificatifs</h2>{p.documents?.length?<div className="mt-4 space-y-3">{p.documents.map((d,i)=><a key={d._id??i} href={`${getApiUrl()}${d.url}`} target="_blank" rel="noreferrer" className="block rounded-xl border p-4 text-sm font-medium text-blue-600 hover:underline">{d.name}</a>)}</div>:<p className="mt-3 text-sm text-red-600">Aucun document enregistré.</p>}</section>{error&&<div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}<div className="mt-8 flex flex-wrap gap-3">{state==="PENDING"&&<><button onClick={approve} disabled={busy} className="rounded-xl bg-black px-5 py-3 font-semibold text-white disabled:opacity-50">Valider le dossier</button><button onClick={()=>setPendingAction({kind:"REJECT"})} disabled={busy} className="rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 disabled:opacity-50">Rejeter</button></>}{state==="ACTIVE"&&<button onClick={()=>setPendingAction({kind:"SUSPEND"})} disabled={busy} className="rounded-xl border border-orange-200 px-5 py-3 font-semibold text-orange-700 disabled:opacity-50">Suspendre</button>}{(state==="SUSPENDED"||state==="REJECTED")&&<button onClick={()=>setPendingAction({kind:"REACTIVATE"})} disabled={busy} className="rounded-xl bg-black px-5 py-3 font-semibold text-white disabled:opacity-50">Réactiver</button>}{state!=="PENDING"&&<button onClick={()=>setPendingAction({kind:"DELETE"})} disabled={busy} className="rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 disabled:opacity-50">Supprimer</button>}</div></div></div>
 <ConfirmDialog ouvert={!!pendingAction} titre={pendingAction?confirmCopy[pendingAction.kind].titre:""} message={pendingAction?confirmCopy[pendingAction.kind].message:""} labelConfirmer={pendingAction?confirmCopy[pendingAction.kind].label:"Confirmer"} danger={pendingAction?.kind!=="REACTIVATE"} chargement={busy} onConfirmer={runPendingAction} onAnnuler={()=>setPendingAction(null)} />
 </main>;
}
