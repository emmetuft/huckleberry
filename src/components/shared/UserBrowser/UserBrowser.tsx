import { FC, useCallback, useState } from 'react';
import { Input, Empty, Spin, Button, Tag } from 'antd';
import {
  CheckIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import { User } from 'models/interfaces/mention';
import { Avatar } from '../Avatar/Avatar';
import { PeopleService } from 'services/people';
import { useInfiniteScroll } from 'hooks/useInfiniteScroll';

interface UserBrowserProps {
  selectedUsers: User[];
  onUsersChange: (users: User[]) => void;
  height?: number;
}

export const UserBrowser: FC<UserBrowserProps> = ({
  selectedUsers,
  onUsersChange,
  height,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const fetcher = useCallback(
    async (limit: number, offset: number) => {
      // TODO: Implement search and pagination in the PeopleService.getUsers method
      const result = await PeopleService.getUsers();
      return result;
    },
    [searchTerm],
  );

  const {
    items: users,
    loading,
    hasMore,
    sentinelRef,
  } = useInfiniteScroll<User>({
    fetcher,
    resetDeps: [searchTerm],
    pageSize: 20,
    debounceMs: 500,
  });

  const isUserSelected = (user: User) =>
    selectedUsers.some((u) => u.id === user.id);

  const handleToggleUser = (user: User) => {
    if (isUserSelected(user)) {
      onUsersChange(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      onUsersChange([...selectedUsers, user]);
    }
  };

  return (
    <div className="itemBrowser">
      <Input
        placeholder="Search people..."
        prefix={<MagnifyingGlassIcon />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        allowClear
      />

      {selectedUsers.length > 0 && (
        <div className="selectedList">
          {selectedUsers.map((user) => (
            <Tag key={user.id} closable onClose={() => handleToggleUser(user)}>
              {user.displayName}
            </Tag>
          ))}
        </div>
      )}

      <div className="itemList" style={{ height: height ?? 400 }}>
        {users.length === 0 && !loading ? (
          <Empty description="No users found" />
        ) : (
          <>
            {users.map((user) => {
              const selected = isUserSelected(user);
              return (
                <div key={user.id} className="appCard">
                  <Avatar userId={user.id} height={42} />
                  <div className="appInfo">
                    <h4>{user.displayName}</h4>
                    {user.email && <p>{user.email}</p>}
                  </div>
                  <div className="connectAction">
                    <Button
                      size="small"
                      type={selected ? 'primary' : 'default'}
                      icon={selected ? <CheckIcon /> : <PlusIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleUser(user);
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {hasMore && (
              <div ref={sentinelRef} className="loadingTrigger">
                {loading && <Spin />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
