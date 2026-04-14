"use client";

import { useState } from "react";
import { MessageCircleMore, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomerPortalNav } from "@/components/customer/customer-portal-nav";
import { readCustomerSession } from "@/lib/customer-portal";
import { toast } from "sonner";

export default function SupportPage() {
  const customer = readCustomerSession();
  const [complaintType, setComplaintType] = useState("Service");
  const [complaintDetails, setComplaintDetails] = useState("");
  const [feedbackRating, setFeedbackRating] = useState("5");
  const [feedbackComment, setFeedbackComment] = useState("");

  const submitComplaint = async () => {
    if (!complaintDetails.trim()) {
      toast.error("Please describe the complaint");
      return;
    }

    const res = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customer?.id,
        customerName: customer?.name || "Guest Customer",
        mobile: customer?.mobile || "",
        complaintType,
        details: complaintDetails,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Could not register the complaint");
      return;
    }

    toast.success(`Complaint registered: ${data.complaint.referenceNo}`);
    setComplaintDetails("");
  };

  const submitFeedback = async () => {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customer?.id,
        customerName: customer?.name || "Guest Customer",
        mobile: customer?.mobile || "",
        rating: Number(feedbackRating),
        comment: feedbackComment,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Could not submit feedback");
      return;
    }

    toast.success("Feedback submitted");
    setFeedbackComment("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      <CustomerPortalNav customer={customer} />

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:gap-6 lg:px-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageCircleMore className="h-5 w-5 text-rose-600" />
              Customer Service
            </CardTitle>
            <CardDescription>
              Use the chat widget for live support, and use this page for formal complaints and service feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p>The chat widget stays available across the public laundry and customer portal pages.</p>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p>Complaints are stored with a generated reference number so your team can follow up reliably.</p>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p>Feedback can be submitted even after delivery, using the same customer profile tied to orders.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Customer profile</p>
              <p className="mt-2 text-sm text-slate-700">
                {customer ? `${customer.name} · ${customer.mobile}` : "No customer session detected. You can still submit general feedback or complaints."}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 lg:mt-0">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Register a Complaint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="complaint-type">Complaint type</Label>
                <Input id="complaint-type" value={complaintType} onChange={(e) => setComplaintType(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="complaint-details">Details</Label>
                <Textarea
                  id="complaint-details"
                  value={complaintDetails}
                  onChange={(e) => setComplaintDetails(e.target.value)}
                  placeholder="Tell us what went wrong and what order or pickup it relates to."
                  rows={5}
                />
              </div>
              <Button onClick={submitComplaint}>Submit Complaint</Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Leave Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="feedback-rating">Rating</Label>
                <Input id="feedback-rating" value={feedbackRating} onChange={(e) => setFeedbackRating(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="feedback-comment">Comment</Label>
                <Textarea
                  id="feedback-comment"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Tell us about your laundry experience."
                  rows={4}
                />
              </div>
              <Button variant="outline" onClick={submitFeedback}>Submit Feedback</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
