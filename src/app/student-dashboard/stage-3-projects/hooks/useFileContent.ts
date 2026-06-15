import { useState, useEffect, useCallback, useRef } from "react";

export function useFileContent(projectId: string, fileId: string | null) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!fileId) {
      setContent("");
      return;
    }

    const fetchContent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${projectId}/files/${fileId}`);
        if (res.ok) {
          const data = await res.json();
          setContent(data.content || "");
        }
      } catch (err) {
        console.error("Failed to load file content", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [projectId, fileId]);

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    if (!fileId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/projects/${projectId}/files/${fileId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newContent }),
        });
      } catch (err) {
        console.error("Failed to auto-save file", err);
      } finally {
        setSaving(false);
      }
    }, 1500); // 1.5s debounce
  }, [projectId, fileId]);

  return {
    content,
    updateContent,
    loading,
    saving
  };
}
