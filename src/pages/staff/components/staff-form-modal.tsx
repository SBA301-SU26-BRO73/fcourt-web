import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/modal'
import { Field } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createStaff, updateStaff } from '@/services/staff/staff.api'
import { getBranches } from '@/services/branch/branch.api'
import type { StaffResponse } from '@/types/staff'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9]{9,11}$/

interface StaffFormModalProps {
  mode: 'create' | 'edit'
  initial?: StaffResponse
  branchId: number
  onClose: () => void
}

export function StaffFormModal({
  mode,
  initial,
  branchId,
  onClose,
}: StaffFormModalProps) {
  const isEdit = mode === 'edit'
  const queryClient = useQueryClient()

  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [password, setPassword] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState<number>(
    initial?.branchId ?? branchId,
  )
  const [touched, setTouched] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: branchPage } = useQuery({
    queryKey: ['branches'],
    queryFn: () =>
      getBranches({ page: 0, size: 100, sortField: 'name', sortDirection: 'asc' }),
  })
  const branches = branchPage?.content ?? []

  // Validation
  const emailValid = EMAIL_RE.test(email)
  const emailError = !email
    ? null
    : !emailValid
      ? 'Nhập đúng định dạng email (vd: name@bro73.app)'
      : null

  const phoneError =
    touched && phone && !PHONE_RE.test(phone)
      ? 'Số điện thoại phải có 9–11 chữ số'
      : null

  const pwError =
    !isEdit && touched && password.length > 0 && password.length < 6
      ? 'Mật khẩu tối thiểu 6 ký tự'
      : null

  const phoneOk = isEdit
    ? phone === '' || PHONE_RE.test(phone)
    : PHONE_RE.test(phone)

  const canSubmit =
    emailValid &&
    !emailError &&
    phoneOk &&
    (isEdit || password.length >= 6)

  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', branchId] })
      onClose()
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setServerError(
        err?.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.',
      )
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { phone?: string; branchId?: number } }) =>
      updateStaff(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', branchId] })
      onClose()
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setServerError(
        err?.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.',
      )
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function handleSubmit() {
    setTouched(true)
    setServerError(null)
    if (!canSubmit) return

    if (isEdit && initial) {
      updateMutation.mutate({
        id: initial.id,
        payload: {
          phone: phone || undefined,
          branchId: selectedBranchId,
        },
      })
    } else {
      createMutation.mutate({
        email,
        password,
        phone,
        branchId: selectedBranchId,
      })
    }
  }

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa tài khoản' : 'Thêm nhân viên'}
      subtitle={
        isEdit
          ? `Cập nhật thông tin tài khoản của ${initial?.email}`
          : 'Tạo tài khoản nhân viên mới cho chi nhánh.'
      }
      onClose={onClose}
      width={580}
      footer={
        <>
          <Button onClick={onClose} disabled={isPending}>
            Huỷ
          </Button>
          <Button
            variant="primary"
            disabled={!canSubmit || isPending}
            onClick={handleSubmit}
          >
            {isPending ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Field
          label="Email (dùng để đăng nhập)"
          required
          error={emailError}
          hint={!emailError ? 'Nhân viên sẽ dùng email này để đăng nhập.' : undefined}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isEdit}
            placeholder="name@bro73.app"
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 ${
              emailError
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-green-500 focus:ring-green-100'
            } ${isEdit ? 'cursor-not-allowed bg-slate-50 text-slate-400' : 'bg-white text-slate-800'}`}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Số điện thoại" required={!isEdit} error={phoneError}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setTouched(true)
              }}
              placeholder="0901234567"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 ${
                phoneError
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-green-500 focus:ring-green-100'
              } bg-white text-slate-800`}
            />
          </Field>

          <Field label="Chi nhánh" required>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {!isEdit && (
          <Field
            label="Mật khẩu tạm thời"
            required
            error={pwError}
            hint={!pwError ? 'Tối thiểu 6 ký tự.' : undefined}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setTouched(true)
              }}
              placeholder="Tối thiểu 6 ký tự"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 ${
                pwError
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-green-500 focus:ring-green-100'
              } bg-white text-slate-800`}
            />
          </Field>
        )}

        {isEdit && initial && (
          <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <span className="text-xs text-slate-500">Trạng thái tài khoản:</span>
            <Badge
              tone={
                initial.userStatus === 'ACTIVE'
                  ? 'green'
                  : initial.userStatus === 'LOCKED'
                    ? 'red'
                    : 'gray'
              }
            >
              {initial.userStatus === 'ACTIVE'
                ? 'Active'
                : initial.userStatus === 'INACTIVE'
                  ? 'Inactive'
                  : initial.userStatus === 'LOCKED'
                    ? 'Locked'
                    : 'Pending'}
            </Badge>
          </div>
        )}
      </div>
    </Modal>
  )
}
