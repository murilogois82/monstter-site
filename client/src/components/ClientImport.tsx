import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface ClientImportProps {
  onImportComplete: () => void;
}

export default function ClientImport({ onImportComplete }: ClientImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const importMutation = trpc.clientManagement.importBulk.useMutation();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension === "csv") {
      // Parse CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setPreviewData(results.data);
          toast.success(`${results.data.length} clientes carregados do CSV`);
        },
        error: (error) => {
          toast.error(`Erro ao ler CSV: ${error.message}`);
        },
      });
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      // Parse Excel
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          setPreviewData(jsonData);
          toast.success(`${jsonData.length} clientes carregados do Excel`);
        } catch (error) {
          toast.error(`Erro ao ler Excel: ${error}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error("Formato de arquivo não suportado. Use CSV ou Excel (.xlsx, .xls)");
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      toast.error("Nenhum dado para importar");
      return;
    }

    setIsImporting(true);

    try {
      // Mapear dados para o formato esperado pela API
      const clients = previewData.map((row: any) => ({
        name: row.nome || row.name || "",
        email: row.email || row["e-mail"] || "",
        phone: row.telefone || row.phone || row.fone || "",
        company: row.empresa || row.company || "",
        document: row.cnpj || row.cpf || row.document || row.documento || "",
        address: row.endereco || row.address || row.endereço || "",
        city: row.cidade || row.city || "",
        state: row.estado || row.state || row.uf || "",
        zipCode: row.cep || row.zipCode || row["zip code"] || "",
        notes: row.observacoes || row.notes || row.obs || row.observações || "",
      }));

      const result = await importMutation.mutateAsync({ clients });

      toast.success(
        `Importação concluída! ${result.success} clientes importados com sucesso.${
          result.failed > 0 ? ` ${result.failed} falharam.` : ""
        }`
      );

      if (result.errors.length > 0) {
        console.error("Erros na importação:", result.errors);
      }

      setPreviewData([]);
      onImportComplete();
    } catch (error) {
      toast.error(`Erro ao importar clientes: ${error}`);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        nome: "João Silva",
        email: "joao@exemplo.com",
        telefone: "(11) 98765-4321",
        empresa: "Empresa Exemplo Ltda",
        cnpj: "12.345.678/0001-90",
        endereco: "Rua Exemplo, 123",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01234-567",
        observacoes: "Cliente preferencial",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    XLSX.writeFile(workbook, "template_importacao_clientes.xlsx");

    toast.success("Template baixado com sucesso!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Importação em Massa de Clientes
        </CardTitle>
        <CardDescription>
          Importe múltiplos clientes de uma vez usando arquivos CSV ou Excel (.xlsx, .xls)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Baixar Template
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-upload">Selecione o arquivo para importar</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isImporting}
          />
          <p className="text-sm text-muted-foreground">
            Formatos aceitos: CSV, Excel (.xlsx, .xls)
          </p>
        </div>

        {previewData.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Pré-visualização ({previewData.length} registros)</h4>
            <div className="max-h-60 overflow-auto border rounded-md p-2">
              <pre className="text-xs">{JSON.stringify(previewData.slice(0, 5), null, 2)}</pre>
              {previewData.length > 5 && (
                <p className="text-xs text-muted-foreground mt-2">
                  ... e mais {previewData.length - 5} registros
                </p>
              )}
            </div>

            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isImporting ? "Importando..." : `Importar ${previewData.length} Clientes`}
            </Button>
          </div>
        )}

        <div className="bg-muted p-4 rounded-md space-y-2">
          <h4 className="font-semibold text-sm">Instruções:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Baixe o template Excel clicando no botão acima</li>
            <li>Preencha os dados dos clientes no template</li>
            <li>Salve o arquivo (pode ser .xlsx ou .csv)</li>
            <li>Faça upload do arquivo usando o botão acima</li>
            <li>Revise a pré-visualização e clique em "Importar"</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
