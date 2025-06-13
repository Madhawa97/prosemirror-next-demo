import ProseMirrorEditor from "@/components/ProseMirrorEditor";
export default function Home() {
  return (
    <div>
        <h1 className="text-3xl">ProseMirror Demo </h1>
        <ProseMirrorEditor content={"How about this as a start"} onChange={undefined}/>
    </div>
  );
}
