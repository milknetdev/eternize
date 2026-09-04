import { Button } from "@/react-app/components/ui/button";
import { MessageCircle, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import type { GuestMessage } from "@/react-app/components/dashboard-types";

// Messages Tab Component
export function MessagesTab({
  messages,
  onApprove,
  onReject,
  onDelete,
}: {
  messages: GuestMessage[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const pendingMessages = messages.filter(m => m.is_approved === null || m.is_approved === undefined);
  const approvedMessages = messages.filter(m => m.is_approved === 1);
  const rejectedMessages = messages.filter(m => m.is_approved === 0);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-semibold">Mensagens dos Convidados</h2>
        <div className="flex gap-4 text-sm">
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
            {pendingMessages.length} pendentes
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
            {approvedMessages.length} aprovadas
          </span>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-lg mb-2">Nenhuma mensagem ainda</h3>
          <p className="text-muted-foreground">
            As mensagens dos convidados aparecerão aqui para você aprovar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingMessages.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Aguardando Aprovação</h3>
              <div className="space-y-3">
                {pendingMessages.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    onApprove={onApprove}
                    onReject={onReject}
                    onDelete={onDelete}
                    showActions
                  />
                ))}
              </div>
            </div>
          )}

          {approvedMessages.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 mt-6">Aprovadas</h3>
              <div className="space-y-3">
                {approvedMessages.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    onApprove={onApprove}
                    onReject={onReject}
                    onDelete={onDelete}
                    status="approved"
                  />
                ))}
              </div>
            </div>
          )}

          {rejectedMessages.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 mt-6">Rejeitadas</h3>
              <div className="space-y-3">
                {rejectedMessages.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    onApprove={onApprove}
                    onReject={onReject}
                    onDelete={onDelete}
                    status="rejected"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Message Card Component
function MessageCard({
  message,
  onApprove,
  onReject,
  onDelete,
  showActions,
  status,
}: {
  message: GuestMessage;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
  showActions?: boolean;
  status?: "approved" | "rejected";
}) {
  return (
    <div className={`bg-white rounded-xl border p-5 ${status === "rejected" ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium">
                {message.guest_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="font-medium">{message.guest_name}</h4>
              <p className="text-xs text-muted-foreground">
                {new Date(message.created_at).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">{message.message}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {showActions ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => onApprove(message.id)}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                Aprovar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onReject(message.id)}
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                Rejeitar
              </Button>
            </>
          ) : (
            <>
              {status === "approved" && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  Aprovada
                </span>
              )}
              {status === "rejected" && (
                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                  Rejeitada
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-red-500"
                onClick={() => onDelete(message.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
