import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock } from 'lucide-react';

const ChildCard = ({ child }) => {
  if (!child) return null;

  const initial = child.hebrew_name ? child.hebrew_name[0] : '';
  const childDetailsUrl = createPageUrl(`Children?childId=${child.id}`);

  return (
    <Link to={childDetailsUrl}>
      <Card className="shadow-lg border-none hover:shadow-xl transition-shadow duration-300 cursor-pointer">
          <CardHeader className="flex flex-row items-center gap-4 p-4">
            <Avatar className="w-16 h-16 text-2xl">
              <AvatarImage src={child.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${child.hebrew_name}`} />
              <AvatarFallback style={{ backgroundColor: child.color, color: 'white' }}>{initial}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold">{child.hebrew_name}</CardTitle>
              <p className="text-slate-500">כיתה {child.grade}</p>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{child.school || 'לא הוגדר בית ספר'}</span>
              </div>
            </div>
          </CardContent>
      </Card>
    </Link>
  );
};

export default ChildCard;