import React from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col gap-8 p-8 bg-gray-50">
      <h1 className="text-3xl font-bold">OmniAgent OS Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold mb-2">Audio Stream</h2>
          {/* TODO: Live transcription panel */}
        </section>
        <section className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold mb-2">Document Inbox</h2>
          {/* TODO: Document upload & summary panel */}
        </section>
        <section className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold mb-2">Camera Feed</h2>
          {/* TODO: Video stream & object detection panel */}
        </section>
      </div>
    </main>
  );
}
