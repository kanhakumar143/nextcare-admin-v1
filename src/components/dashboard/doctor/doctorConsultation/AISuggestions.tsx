"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Plus } from "lucide-react";

interface AISuggestionsProps {
  title: string;
  suggestions: any[];
  onAddSuggestion: (suggestion: any) => void;
  type: "medicine" | "labtest";
}

function AISuggestions({
  title,
  suggestions,
  onAddSuggestion,
  type,
}: AISuggestionsProps) {
  console.log("AI Suggestions Rendered: ", suggestions);
  return (
    <Card className="shadow-sm border-1 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
          <CardTitle className="text-sm font-semibold text-purple-800">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-2 pb-4 max-h-[25vh] max-w-full">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {type === "medicine"
                      ? suggestion.name
                      : suggestion.test_name || suggestion.test_display}
                  </p>
                  {type === "medicine" && (
                    <p className="text-xs text-gray-600">
                      {suggestion.strength} • {suggestion.form} •{" "}
                      {suggestion.frequency}
                    </p>
                  )}
                  {type === "labtest" && (
                    <p className="text-xs text-gray-600">
                      {suggestion.priority} • {suggestion.intent}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => onAddSuggestion(suggestion)}
                  size="sm"
                  variant="ghost"
                  className="ml-2 h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="px-6 border-t border-purple-100 flex-shrink-0">
          <p className="text-xs text-purple-600 text-center">
            AI-powered suggestions based on symptoms
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default AISuggestions;
