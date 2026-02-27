"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { sampleDataset } from "@/data/sample-data";
import { emptyDataset, getDataset, resetToBlank, resetToDemo, saveDataset } from "@/lib/storage/local";
import { AppDataset, RecommendResponse, ScoreResponse } from "@/lib/types";

type State = {
  dataset: AppDataset;
  scores: ScoreResponse | null;
  recommendation: RecommendResponse | null;
  loading: boolean;
  error: string | null;
};

export const useBurnoutData = () => {
  const [state, setState] = useState<State>({
    dataset: emptyDataset,
    scores: null,
    recommendation: null,
    loading: false,
    error: null
  });

  const fetchAll = useCallback(async (dataset: AppDataset) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [scoreRes, recRes] = await Promise.all([
        fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataset)
        }),
        fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataset })
        })
      ]);

      if (!scoreRes.ok || !recRes.ok) throw new Error("API request failed");

      const scores = (await scoreRes.json()) as ScoreResponse;
      const recommendation = (await recRes.json()) as RecommendResponse;

      setState((s) => ({ ...s, dataset, scores, recommendation, loading: false }));
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error: (error as Error).message }));
    }
  }, []);

  useEffect(() => {
    const fromStorage = getDataset();
    void fetchAll(fromStorage);
  }, [fetchAll]);

  const setDataset = useCallback(
    (dataset: AppDataset) => {
      saveDataset(dataset);
      void fetchAll(dataset);
    },
    [fetchAll]
  );

  const loadDemo = useCallback(() => {
    resetToDemo();
    void fetchAll(sampleDataset);
  }, [fetchAll]);

  const loadBlank = useCallback(() => {
    resetToBlank();
    void fetchAll(emptyDataset);
  }, [fetchAll]);

  const latest = useMemo(() => state.scores?.daily[state.scores.daily.length - 1] ?? null, [state.scores]);

  return {
    ...state,
    latest,
    setDataset,
    loadDemo,
    loadBlank,
    refresh: () => fetchAll(state.dataset)
  };
};
