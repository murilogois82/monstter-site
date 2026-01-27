import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { pt } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { View } from "react-big-calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const locales = {
  "pt-BR": pt,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface ServiceOrderEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: {
    osNumber: string;
    clientName: string;
    serviceType: string;
    totalHours: number;
    status: string;
  };
}

interface ServiceOrderCalendarProps {
  events: ServiceOrderEvent[];
  onSelectEvent?: (event: ServiceOrderEvent) => void;
}

export default function ServiceOrderCalendar({
  events,
  onSelectEvent,
}: ServiceOrderCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<ServiceOrderEvent | null>(
    null
  );

  const handleSelectEvent = (event: ServiceOrderEvent) => {
    setSelectedEvent(event);
    onSelectEvent?.(event);
  };

  const customEventStyleGetter = (event: ServiceOrderEvent) => {
    let backgroundColor = "#ef4444"; // red for default

    if (event.resource.status === "completed") {
      backgroundColor = "#22c55e"; // green
    } else if (event.resource.status === "in_progress") {
      backgroundColor = "#f59e0b"; // amber
    } else if (event.resource.status === "draft") {
      backgroundColor = "#6b7280"; // gray
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Calendário de Ordens de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg overflow-hidden" style={{ height: "600px" }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={customEventStyleGetter}
              popup
              views={["month", "week", "day"]}
              defaultView="month"
              defaultDate={new Date()}
              messages={{
                today: "Hoje",
                previous: "Anterior",
                next: "Próximo",
                month: "Mês",
                week: "Semana",
                day: "Dia",
                agenda: "Agenda",
                date: "Data",
                time: "Hora",
                event: "Evento",
                noEventsInRange: "Nenhuma ordem de serviço neste período",
                showMore: (total: number) => `+ ${total} mais`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Ordem de Serviço</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground/60">Número OS</p>
                <p className="text-lg font-semibold">
                  {selectedEvent.resource.osNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Cliente</p>
                <p className="text-lg font-semibold">
                  {selectedEvent.resource.clientName}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Tipo de Serviço</p>
                <p className="text-lg font-semibold">
                  {selectedEvent.resource.serviceType}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Horas</p>
                <p className="text-lg font-semibold">
                  {selectedEvent.resource.totalHours.toFixed(1)}h
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Data Início</p>
                <p className="text-lg font-semibold">
                  {format(selectedEvent.start, "dd/MM/yyyy HH:mm", {
                    locale: pt,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Data Fim</p>
                <p className="text-lg font-semibold">
                  {format(selectedEvent.end, "dd/MM/yyyy HH:mm", {
                    locale: pt,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Status</p>
                <Badge
                  variant={
                    selectedEvent.resource.status === "completed"
                      ? "default"
                      : "secondary"
                  }
                >
                  {selectedEvent.resource.status === "completed"
                    ? "Concluída"
                    : selectedEvent.resource.status === "in_progress"
                      ? "Em Progresso"
                      : selectedEvent.resource.status === "draft"
                        ? "Rascunho"
                        : "Enviada"}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
