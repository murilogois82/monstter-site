import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface ServiceOrderEvent {
  id: number;
  osNumber: string;
  partnerName: string;
  startDateTime: Date;
  endDateTime: Date;
  status: "draft" | "in_progress" | "completed" | "closed";
  totalHours: number;
}

interface CalendarComponentProps {
  events: ServiceOrderEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: ServiceOrderEvent) => void;
  selectedPartner?: number;
}

export default function CalendarComponent({
  events,
  onDateClick,
  onEventClick,
  selectedPartner,
}: CalendarComponentProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDateTime);
      const isSameDate = isSameDay(eventDate, day);
      const matchesPartner =
        !selectedPartner || event.id === selectedPartner;
      return isSameDate && matchesPartner;
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "closed":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-white">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="border-gray-700 hover:bg-gray-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="border-gray-700 hover:bg-gray-800"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty days before month starts */}
          {emptyDays.map((_, index) => (
            <div
              key={`empty-${index}`}
              className="aspect-square bg-gray-800/30 rounded-lg"
            />
          ))}

          {/* Days of month */}
          {daysInMonth.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateClick?.(day)}
                className={`aspect-square rounded-lg p-1 text-xs transition-all duration-200 ${
                  isToday
                    ? "bg-red-500/20 border-2 border-red-500"
                    : "bg-gray-800/50 border border-gray-700 hover:bg-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="h-full flex flex-col">
                  <span className={`font-semibold ${isToday ? "text-red-400" : "text-gray-300"}`}>
                    {format(day, "d")}
                  </span>

                  {/* Events for this day */}
                  <div className="flex-1 overflow-y-auto mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        className={`w-full text-left px-1 py-0.5 rounded text-xs truncate border ${getStatusColor(event.status)} hover:opacity-80 transition-opacity`}
                        title={`${event.osNumber} - ${event.partnerName}`}
                      >
                        {event.osNumber}
                      </button>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-400 px-1">
                        +{dayEvents.length - 2} mais
                      </div>
                    )}
                  </div>

                  {/* Event count badge */}
                  {dayEvents.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="mt-1 w-full justify-center bg-red-500/20 text-red-400 text-xs"
                    >
                      {dayEvents.length} OS
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-700 space-y-2">
          <h4 className="text-sm font-semibold text-white mb-2">Legenda</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-500/20 border border-gray-500/30"></div>
              <span className="text-gray-400">Rascunho</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30"></div>
              <span className="text-gray-400">Em Progresso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30"></div>
              <span className="text-gray-400">Concluída</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500/20 border border-purple-500/30"></div>
              <span className="text-gray-400">Fechada</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
