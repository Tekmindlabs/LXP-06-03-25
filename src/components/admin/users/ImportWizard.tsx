import { useState } from "react";
import { Card, Button, Stepper, FileUpload } from "~/components/ui";
import { DataPreview } from "./DataPreview";
import { api } from "~/utils/api";

type ImportStep = "upload" | "preview" | "mapping" | "validation" | "import";

export const ImportWizard = () => {
  const [currentStep, setCurrentStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fieldMapping, setFieldMapping] = useState({});

  const importMutation = api.user.import.useMutation();

  const steps = [
    { id: "upload", label: "Upload File" },
    { id: "preview", label: "Preview Data" },
    { id: "mapping", label: "Field Mapping" },
    { id: "validation", label: "Validation" },
    { id: "import", label: "Import" }
  ];

  const handleFileUpload = (file: File) => {
    setFile(file);
    // Parse file and set preview data
  };

  const handleImport = async () => {
    await importMutation.mutateAsync({
      data: previewData,
      mapping: fieldMapping
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onChange={setCurrentStep as any}
        />

        <div className="mt-8">
          {currentStep === "upload" && (
            <FileUpload
              accept=".csv,.xlsx"
              onUpload={handleFileUpload}
            />
          )}

          {currentStep === "preview" && (
            <DataPreview data={previewData} />
          )}

          {/* Add other step components */}

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                const currentIndex = steps.findIndex(s => s.id === currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1].id as ImportStep);
                }
              }}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                const currentIndex = steps.findIndex(s => s.id === currentStep);
                if (currentIndex < steps.length - 1) {
                  setCurrentStep(steps[currentIndex + 1].id as ImportStep);
                } else {
                  handleImport();
                }
              }}
            >
              {currentStep === "import" ? "Start Import" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}; 