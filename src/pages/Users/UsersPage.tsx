import { useEffect, useState } from "react"

import { usersApi } from "@/api/users"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/useAuth"
import type { AuthUser } from "@/types/auth"

import { AddUserDialog } from "./AddUserDialog"
import { ChangePasswordDialog } from "./ChangePasswordDialog"
import { DeleteUserDialog } from "./DeleteUserDialog"
import { EditUserDialog } from "./EditUserDialog"

function sortUsers(users: AuthUser[]): AuthUser[] {
  return [...users].sort((a, b) =>
    a.permissionLevel !== b.permissionLevel
      ? b.permissionLevel - a.permissionLevel
      : a.name.localeCompare(b.name, "pl")
  )
}

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const isSupervisor = currentUser?.canWrite.management ?? false

  const [users, setUsers] = useState<AuthUser[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [passwordDialogUser, setPasswordDialogUser] = useState<AuthUser | null>(null)
  const [deleteDialogUser, setDeleteDialogUser] = useState<AuthUser | null>(null)
  const [editDialogUser, setEditDialogUser] = useState<AuthUser | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  function loadUsers() {
    setStatus("loading")
    usersApi
      .list()
      .then((data) => {
        setUsers(sortUsers(data))
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>
  }

  if (status === "error") {
    return <p className="text-sm text-destructive">Nie udało się wczytać listy użytkowników.</p>
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Użytkownicy</CardTitle>
        {isSupervisor && (
          <CardAction>
            <Button type="button" size="sm" onClick={() => setIsAddDialogOpen(true)}>
              Dodaj nowego użytkownika
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 pr-4 font-normal">Nazwa</th>
              <th className="py-2 pr-4 font-normal">Email</th>
              <th className="py-2 pr-4 font-normal">Poziom uprawnień</th>
              <th className="py-2 font-normal">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {users.map((rowUser) => {
              const isOwnAccount = currentUser?.id === rowUser.id
              const canChangePassword = isOwnAccount || isSupervisor

              return (
                <tr key={rowUser.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{rowUser.name}</td>
                  <td className="py-2 pr-4">
                    {rowUser.email ?? <span className="text-muted-foreground">******</span>}
                  </td>
                  <td className="py-2 pr-4">{rowUser.permissionLevelLabel}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      {isSupervisor && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditDialogUser(rowUser)}
                        >
                          Edytuj
                        </Button>
                      )}
                      {canChangePassword && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPasswordDialogUser(rowUser)}
                        >
                          Zmień hasło
                        </Button>
                      )}
                      {isSupervisor && !isOwnAccount && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteDialogUser(rowUser)}
                        >
                          Usuń konto
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>

      {editDialogUser && (
        <EditUserDialog
          user={editDialogUser}
          onOpenChange={(open) => !open && setEditDialogUser(null)}
          onSuccess={(updatedUser) => {
            setEditDialogUser(null)
            setUsers((prev) => sortUsers(prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))))
          }}
        />
      )}

      {passwordDialogUser && (
        <ChangePasswordDialog
          user={passwordDialogUser}
          onOpenChange={(open) => !open && setPasswordDialogUser(null)}
          onSuccess={() => setPasswordDialogUser(null)}
        />
      )}

      {deleteDialogUser && (
        <DeleteUserDialog
          user={deleteDialogUser}
          onOpenChange={(open) => !open && setDeleteDialogUser(null)}
          onSuccess={() => {
            setDeleteDialogUser(null)
            loadUsers()
          }}
        />
      )}

      {isAddDialogOpen && (
        <AddUserDialog
          onOpenChange={setIsAddDialogOpen}
          onSuccess={(newUser) => {
            setIsAddDialogOpen(false)
            setUsers((prev) => sortUsers([...prev, newUser]))
          }}
        />
      )}
    </Card>
  )
}
