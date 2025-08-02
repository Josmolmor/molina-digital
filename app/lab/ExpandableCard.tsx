'use client';

import { Button } from '@/components/ui/button';
import {
  Ban,
  Check,
  ChevronsDownUp,
  Loader,
  MailCheck,
  MailWarning,
  MailX,
  X,
} from 'lucide-react';
import { useRef, useReducer } from 'react';

const actionTypes = {
  setInitialLoad: 'setInitialLoad',
  setIsExpanded: 'setIsExpanded',
  setIsSyncing: 'setIsSyncing',
  setSyncComplete: 'setSyncComplete',
  setSyncFailed: 'setSyncFailed',
  setFilesCount: 'setFilesCount',
} as const;

const emailReducer = (
  state: {
    initialLoad: boolean;
    isExpanded: boolean;
    isSyncing: boolean;
    syncComplete: boolean;
    syncFailed: boolean;
    filesCount: number;
  },
  action: {
    type: (typeof actionTypes)[keyof typeof actionTypes];
    payload: any;
  },
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.setInitialLoad:
      return { ...state, initialLoad: payload };
    case actionTypes.setIsExpanded:
      return { ...state, isExpanded: payload };
    case actionTypes.setIsSyncing:
      return { ...state, isSyncing: payload };
    case actionTypes.setSyncComplete:
      return { ...state, syncComplete: payload };
    case actionTypes.setSyncFailed:
      return { ...state, syncFailed: payload };
    case actionTypes.setFilesCount:
      return { ...state, filesCount: payload };
  }

  return state;
};

const ExpandableCard = () => {
  const [emailState, setEmailState] = useReducer(emailReducer, {
    initialLoad: true,
    isExpanded: false,
    isSyncing: false,
    syncComplete: false,
    syncFailed: false,
    filesCount: 0,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSync = (value: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setEmailState({ type: actionTypes.setIsExpanded, payload: value });
    setEmailState({ type: actionTypes.setFilesCount, payload: 0 });
    setEmailState({ type: actionTypes.setIsSyncing, payload: value });

    // Only reset states when cancelling (value is false)
    if (!value) {
      setEmailState({ type: actionTypes.setSyncComplete, payload: false });
      setEmailState({ type: actionTypes.setSyncFailed, payload: false });
    }

    if (value) {
      const randomFiles = Math.floor(Math.random() * 50) + 2;
      setEmailState({ type: actionTypes.setFilesCount, payload: randomFiles });

      timeoutRef.current = setTimeout(() => {
        setEmailState({ type: actionTypes.setIsSyncing, payload: false });
        setEmailState({ type: actionTypes.setInitialLoad, payload: false });

        // Reset previous states before setting new one
        setEmailState({ type: actionTypes.setSyncComplete, payload: false });
        setEmailState({ type: actionTypes.setSyncFailed, payload: false });

        // 30% chance of failure
        const shouldFail = Math.random() < 0.3;
        if (shouldFail) {
          setEmailState({ type: actionTypes.setSyncFailed, payload: true });
        } else {
          setEmailState({ type: actionTypes.setSyncComplete, payload: true });
        }
      }, 2750);
    }
  };

  const handleCollapse = () => {
    setEmailState({ type: actionTypes.setIsExpanded, payload: false });
  };

  return (
    <div>
      <div className="w-full h-56 bg-background rounded-2xl flex items-center justify-center">
        <div
          className={`w-full max-w-[480px] mx-4 sm:mx-0 bg-border rounded-2xl transition-all duration-300 ease-in-out-quad flex flex-col overflow-hidden ${
            emailState.isExpanded ? 'h-26' : 'h-16'
          }`}
        >
          <div className="w-full h-[4rem] gap-2 bg-card rounded-2xl border border-border flex p-4 justify-between flex-shrink-0">
            <div className="flex gap-2 items-center">
              {emailState.initialLoad ? (
                <MailWarning className="size-6 flex-shrink-0 text-foreground" />
              ) : emailState.syncFailed ? (
                <MailX className="size-6 flex-shrink-0 text-foreground" />
              ) : (
                <MailCheck className="size-6 flex-shrink-0 text-foreground" />
              )}
              <div className="flex flex-col">
                <span className="flex items-baseline text-foreground font-medium">
                  Unread emails
                </span>
                <p className="flex items-center gap-1 text-xs text-muted-foreground/90 transition-all duration-300 ease-in-out-quad">
                  <span className="break-all">molina@expand.me</span>
                  {emailState.filesCount > 0 && !emailState.syncFailed && (
                    <span
                      className={`hidden sm:block ${
                        emailState.isSyncing ? 'opacity-0' : 'opacity-100'
                      } transition-all duration-300 ease-in-out-quad`}
                    >
                      {emailState.isSyncing
                        ? ''
                        : ` · ${emailState.filesCount} emails`}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="transition-all duration-300 ease-in-out-quad rounded-lg"
                onClick={() => handleSync(true)}
                disabled={emailState.isSyncing}
              >
                Sync
              </Button>
            </div>
          </div>
          <div
            className={`flex items-center justify-center gap-2 text-gray-500 relative overflow-hidden h-full transition-all duration-300 ease-in-out-quad ${
              !emailState.isExpanded
                ? 'translate-y-full opacity-0'
                : 'translate-y-0 opacity-100'
            }`}
          >
            <div
              className={`flex items-center gap-2 absolute inset-0 px-4 transition-transform duration-300 ease-in-out-quad ${
                emailState.isSyncing
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-full opacity-0'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
                <Loader className="size-4 animate-spin text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-semibold text-muted-foreground animate-pulse truncate">
                  Syncing...
                </span>
              </div>
              <button
                onClick={() => handleSync(false)}
                className="text-muted-foreground hover:text-foreground ease-in-out-quad easy-click transition-all duration-300 flex-shrink-0"
              >
                <Ban className="size-4" />
              </button>
            </div>
            <div
              className={`flex items-center gap-2 absolute inset-0 px-4 transition-transform duration-300 ease-in-out-quad ${
                emailState.syncComplete && !emailState.isSyncing
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-full opacity-0'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
                <Check className="size-4 text-green-500 flex-shrink-0" />
                <span className="text-xs font-medium text-foreground truncate">
                  {emailState.filesCount} emails synced
                </span>
              </div>
              <button
                onClick={handleCollapse}
                className="text-muted-foreground hover:text-foreground ease-in-out-quad easy-click transition-all duration-300 flex-shrink-0"
              >
                <ChevronsDownUp className="size-4" />
              </button>
            </div>
            <div
              className={`flex items-center gap-2 absolute inset-0 px-4 transition-transform duration-300 ease-in-out-quad ${
                emailState.syncFailed && !emailState.isSyncing
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-full opacity-0'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
                <X className="size-4 text-red-500 flex-shrink-0" />
                <span className="text-xs font-medium text-foreground truncate">
                  Sync failed - connection error
                </span>
              </div>
              <button
                onClick={handleCollapse}
                className="text-muted-foreground hover:text-foreground ease-in-out-quad easy-click transition-all duration-300 flex-shrink-0"
              >
                <ChevronsDownUp className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandableCard;
