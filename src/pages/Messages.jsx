import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Question } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageCircle, Reply, X, CheckCircle2, User as UserIcon, Users, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// Import hooks for the new architecture
import { useFamilyContext } from '@/components/context/FamilyContext';
import { useMembers } from '@/components/hooks/useMembers';
import { useChildrenWithMembers } from '@/components/hooks/useChildrenWithMembers';

const MessageThread = ({ thread, onReply, onMarkAsRead, currentUser, allMembers, children }) => {
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [replyText, setReplyText] = useState('');

  const getMemberById = useCallback((memberId) => {
    return allMembers.find(m => m.id === memberId);
  }, [allMembers]);

  const getChildName = (childId) => {
    const child = children.find(c => c.id === childId);
    return child?.hebrew_name || 'לא ידוע';
  };
  
  const isParticipant = thread.some(msg => 
    msg.from_member_id === currentUser.id || 
    msg.recipient_member_ids?.includes(currentUser.id)
  );

  useEffect(() => {
    if (isParticipant) {
      const lastMessage = thread[thread.length - 1];
      const isRead = lastMessage.is_read_by?.includes(currentUser.id);
      if (lastMessage.from_member_id !== currentUser.id && !isRead) {
        onMarkAsRead(lastMessage.id);
      }
    }
  }, [thread, currentUser.id, isParticipant, onMarkAsRead]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    
    const allParticipantIds = [...new Set(thread.flatMap(msg => [msg.from_member_id, ...msg.recipient_member_ids]))];
    const replyRecipients = allParticipantIds.filter(id => id !== currentUser.id);
    
    await onReply(thread[0].thread_id, replyText, replyRecipients);
    setReplyText('');
    setShowReplyDialog(false);
  };

  if (!isParticipant) return null;

  // The thread is already sorted when passed as a prop
  const firstMessage = thread[0];

  return (
    <>
      <Card className="shadow-md border-r-4 border-r-blue-500">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 flex-1">
              <MessageCircle className="w-6 h-6 text-blue-500" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">משתתפים:</span>
                  {[...new Set(thread.flatMap(msg => [msg.from_member_id, ...(msg.recipient_member_ids || [])]))]
                    .map(id => getMemberById(id)?.hebrew_name)
                    .filter(Boolean)
                    .map((name, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{name}</Badge>
                    ))}
                </div>
                {firstMessage.child_id && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    נושא: {getChildName(firstMessage.child_id)}
                  </Badge>
                )}
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {format(new Date(firstMessage.created_date), 'dd/MM/yy')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {thread.map((message, index) => {
            const sender = getMemberById(message.from_member_id);
            if (!sender) return null; // Should not happen if data is consistent
            
            const isRead = message.is_read_by?.length > 0;

            return (
              <div key={message.id || index} className={`p-3 rounded-lg ${message.from_member_id === currentUser.id ? 'bg-blue-50 mr-8' : 'bg-gray-50 ml-8'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={sender.image_url} />
                    <AvatarFallback style={{backgroundColor: sender.color}} className="text-xs text-white">
                      {sender.hebrew_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-sm">{sender.hebrew_name}</span>
                  <span className="text-xs text-slate-500">
                    {format(new Date(message.created_date), 'HH:mm')}
                  </span>
                  {isRead && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" title="נקראה" />
                  )}
                </div>
                <p className="text-slate-700">{message.content}</p>
              </div>
            );
          })}
          
          <div className="flex justify-end pt-2">
            <Button onClick={() => setShowReplyDialog(true)} size="sm">
              <Reply className="w-4 h-4 ml-2" />
              השב
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>השב להודעה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="כתוב את התגובה שלך..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
              <X className="w-4 h-4 ml-2" />
              ביטול
            </Button>
            <Button onClick={handleReply} disabled={!replyText.trim()}>
              <Send className="w-4 h-4 ml-2" />
              שלח תגובה
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};


export default function MessagesPage() {
    const { user: currentUser, family } = useFamilyContext();
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
    const [newMessage, setNewMessage] = useState({ content: '', recipient_ids: [] });

    // New data fetching using hooks
    const { data: allMembers, isLoading: isLoadingMembers } = useMembers(family?.id);
    const { data: children, isLoading: isLoadingChildren } = useChildrenWithMembers(family?.id);

    const loadMessages = useCallback(async () => {
        if (!family?.id) return;
        setIsLoading(true);
        try {
            // Fetch messages where current user is sender or recipient
            const sent = await Question.filter({ family_id: family.id, from_member_id: currentUser.id });
            const received = await Question.filter({ family_id: family.id, recipient_member_ids: { '$in': [currentUser.id] } });
            
            // Combine and remove duplicates
            const allMessages = [...sent, ...received];
            const uniqueMessages = Array.from(new Map(allMessages.map(m => [m.id, m])).values());
            
            setMessages(uniqueMessages);
        } catch (e) {
            console.error("Failed to load messages", e);
        } finally {
            setIsLoading(false);
        }
    }, [family?.id, currentUser?.id]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    const handleSendMessage = async () => {
        if (!newMessage.content.trim() || newMessage.recipient_ids.length === 0) {
          alert('יש למלא תוכן ולבחור לפחות נמען אחד');
          return;
        }

        const messageData = {
          family_id: family.id,
          content: newMessage.content,
          from_member_id: currentUser.id,
          recipient_member_ids: newMessage.recipient_ids,
          thread_id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: format(new Date(), 'yyyy-MM-dd'),
          is_read_by: []
        };

        try {
          await Question.create(messageData);
          setShowNewMessageDialog(false);
          setNewMessage({ content: '', recipient_ids: [] });
          await loadMessages();
        } catch (error) {
          console.error("Error sending message:", error);
          alert('שגיאה בשליחת ההודעה');
        }
    };

    const handleReply = async (threadId, replyContent, recipients) => {
        const replyData = {
          family_id: family.id,
          content: replyContent,
          from_member_id: currentUser.id,
          recipient_member_ids: recipients,
          thread_id: threadId,
          date: format(new Date(), 'yyyy-MM-dd'),
          is_read_by: []
        };

        try {
          await Question.create(replyData);
          await loadMessages();
        } catch (error) {
          console.error("Error replying to message:", error);
          alert('שגיאה בשליחת התגובה');
        }
    };
    
    const handleMarkAsRead = useCallback(async (messageId) => {
        const message = messages.find(m => m.id === messageId);
        if (!message) return;

        const updatedReadBy = [...new Set([...(message.is_read_by || []), currentUser.id])];
        
        try {
            await Question.update(messageId, { is_read_by: updatedReadBy });
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_read_by: updatedReadBy } : m));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    }, [messages, currentUser.id]);

    const handleRecipientChange = (recipientId, checked) => {
        setNewMessage(prev => ({
          ...prev,
          recipient_ids: checked
            ? [...prev.recipient_ids, recipientId]
            : prev.recipient_ids.filter(id => id !== recipientId)
        }));
    };

    const messageThreads = useMemo(() => {
        const threads = {};
        messages.forEach(msg => {
            const threadId = msg.thread_id;
            if (!threads[threadId]) threads[threadId] = [];
            threads[threadId].push(msg);
        });
        // Sort messages within each thread and then sort threads by last message date
        Object.values(threads).forEach(thread => thread.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
        return Object.fromEntries(Object.entries(threads).sort(([, a], [, b]) => new Date(b[b.length-1].created_date) - new Date(a[a.length-1].created_date)));
    }, [messages]);
    
    const availableRecipients = useMemo(() => {
        return (allMembers || []).filter(m => m.id !== currentUser.id);
    }, [allMembers, currentUser.id]);

    if (isLoading || isLoadingMembers || isLoadingChildren) {
        return (
          <div className="p-8 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        );
    }
    
    return (
        <div className="p-4 md:p-8" dir="rtl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">הודעות</h1>
                <Button onClick={() => setShowNewMessageDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 ml-2" />
                  שלח הודעה חדשה
                </Button>
            </div>

            <div className="space-y-6">
                {Object.keys(messageThreads).length > 0 ? (
                  Object.entries(messageThreads).map(([threadId, thread]) => (
                    <MessageThread 
                      key={threadId} 
                      thread={thread} 
                      onReply={handleReply} 
                      onMarkAsRead={handleMarkAsRead}
                      currentUser={currentUser}
                      allMembers={allMembers}
                      children={children}
                    />
                  ))
                ) : (
                  <Card className="text-center p-8 border-dashed border-2 border-slate-200">
                    <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">אין הודעות עדיין.</p>
                    <p className="text-slate-400 text-sm mt-2">לחץ על "שלח הודעה חדשה" כדי להתחיל שיחה.</p>
                  </Card>
                )}
            </div>

            <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>הודעה חדשה</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-3">
                            <Label>בחר נמענים:</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableRecipients.map(recipient => (
                                    <div key={recipient.id} className="flex items-center space-x-2 space-x-reverse">
                                      <Checkbox 
                                        id={recipient.id} 
                                        checked={newMessage.recipient_ids.includes(recipient.id)}
                                        onCheckedChange={(checked) => handleRecipientChange(recipient.id, checked)}
                                      />
                                      <Label htmlFor={recipient.id} className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6">
                                            <AvatarImage src={recipient.image_url} />
                                            <AvatarFallback style={{backgroundColor: recipient.color}} className="text-white text-xs">{recipient.hebrew_name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        {recipient.hebrew_name}
                                      </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>תוכן ההודעה:</Label>
                            <Textarea
                                value={newMessage.content}
                                onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                                placeholder="כתוב את ההודעה שלך..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowNewMessageDialog(false)}>
                            <X className="w-4 h-4 ml-2" />
                            ביטול
                        </Button>
                        <Button 
                          onClick={handleSendMessage} 
                          disabled={!newMessage.content.trim() || newMessage.recipient_ids.length === 0}
                        >
                          <Send className="w-4 h-4 ml-2" />
                          שלח הודעה
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}