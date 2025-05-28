import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState({ code: "", amount: "", expires: "" });

  useEffect(() => {
    // TODO: Fetch existing vouchers from API
    // fetch('/api/vouchers').then(...)
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    // TODO: Post new voucher to API
    // const res = await fetch('/api/vouchers', { method: 'POST', body: JSON.stringify(form) });
    // const newVoucher = await res.json();
    // setVouchers([...vouchers, newVoucher]);
    setForm({ code: "", amount: "", expires: "" });
  };

  const handleDelete = async (id) => {
    // TODO: Delete voucher via API
    // await fetch(`/api/vouchers/${id}`, { method: 'DELETE' });
    setVouchers(vouchers.filter(v => v.id !== id));
  };

  return (
    <div className="p-6 grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Gutschein ausstellen</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="flex flex-col">
              <label htmlFor="code" className="mb-1 font-medium">Code</label>
              <Input id="code" name="code" value={form.code} onChange={handleChange} placeholder="ZB: SOMMER2025" required />
            </div>
            <div className="flex flex-col">
              <label htmlFor="amount" className="mb-1 font-medium">Betrag (€)</label>
              <Input id="amount" name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} placeholder="z.B. 50.00" required />
            </div>
            <div className="flex flex-col">
              <label htmlFor="expires" className="mb-1 font-medium">Ablaufdatum</label>
              <Input id="expires" name="expires" type="date" value={form.expires} onChange={handleChange} required />
            </div>
            <Button type="submit">Gutschein erstellen</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gutscheine verwalten</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Betrag</TableHead>
                <TableHead>Ablaufdatum</TableHead>
                <TableHead>Aktion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.code}</TableCell>
                  <TableCell>{v.amount} €</TableCell>
                  <TableCell>{format(new Date(v.expires), 'dd.MM.yyyy')}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(v.id)}>
                      Löschen
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {vouchers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Keine Gutscheine gefunden.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
