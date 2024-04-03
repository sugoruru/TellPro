"use client";

export default function makeNewPage({ params }: { params: { userID: string; pageID: string } }) {
  return (
    <div>
      <p>{params.pageID}</p>
      <p>{params.userID}</p>
    </div>
  );
}
