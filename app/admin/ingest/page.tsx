"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Database, Upload } from "lucide-react";

export default function AdminIngestPage() {
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      const res = await fetch("/api/curriculum/chapters/all");
      if (res.ok) {
        const data = await res.json();
        setChapters(data.chapters);
      }
    } catch (err) {
      console.error("Failed to fetch chapters", err);
      toast.error("Failed to load curriculum data.");
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async (chapterId: string, version: "bangla" | "english") => {
    setProcessingId(`${chapterId}-${version}`);
    
    try {
      const res = await fetch("/api/admin/ingest-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter_id: chapterId, version }),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success(`Success! Created ${result.chunks_created} chunks (${result.total_tokens} tokens).`);
        await fetchChapters(); // Refresh status
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (err) {
      toast.error("Failed to connect to ingestion service.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ingested": return <Badge className="bg-green-500">Ingested</Badge>;
      case "ingesting": return <Badge className="bg-yellow-500 animate-pulse">Ingesting</Badge>;
      case "failed": return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-8 p-4 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 flex items-start gap-3">
        <Database className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-800 mb-1">Admin PDF Ingestion Pipeline</p>
          <p>
            Place PDFs at <code className="bg-slate-200 px-1 py-0.5 rounded">/data/textbooks/</code> with names: 
            <code className="bg-slate-200 px-1 py-0.5 rounded mx-1">physics_bn.pdf</code>, 
            <code className="bg-slate-200 px-1 py-0.5 rounded mx-1">physics_en.pdf</code>, 
            <code className="bg-slate-200 px-1 py-0.5 rounded mx-1">biology_bn.pdf</code>, 
            <code className="bg-slate-200 px-1 py-0.5 rounded mx-1">biology_en.pdf</code>
          </p>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6">Curriculum Chapters</h1>

      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {chapters.length === 0 ? (
            <div className="text-center p-10 text-slate-500 border border-dashed rounded-xl">
              No chapters found. Please run the curriculum seed first.
            </div>
          ) : (
            chapters.map((chapter) => (
              <Card key={chapter.id} className="overflow-hidden">
                <CardHeader className="bg-slate-50 border-b py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {chapter.subjects?.name_en} — Chapter {chapter.chapter_number}
                        {getStatusBadge(chapter.pdf_status)}
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-1">
                        {chapter.title_en} / {chapter.title_bn} (Pages {chapter.page_start}-{chapter.page_end})
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex gap-4">
                  <Button 
                    onClick={() => handleIngest(chapter.id, "bangla")}
                    disabled={processingId !== null}
                    className="flex-1 bg-primary text-white"
                  >
                    {processingId === `${chapter.id}-bangla` ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ingesting Bangla...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" /> Ingest Bangla PDF</>
                    )}
                  </Button>
                  <Button 
                    onClick={() => handleIngest(chapter.id, "english")}
                    disabled={processingId !== null}
                    variant="outline"
                    className="flex-1"
                  >
                    {processingId === `${chapter.id}-english` ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ingesting English...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" /> Ingest English PDF</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
